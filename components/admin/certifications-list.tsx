"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSearch } from "@/hooks/use-search"
import { certificateService, Certificate } from "@/services/certificate.service"
import { PageLoader } from "@/components/ui/page-loader"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, Award, BookOpen, Calendar, User, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

function formatCertificateDates(data: Certificate[]): Certificate[] {
  return data.map(cert => ({
    ...cert,
    issuedDate: cert.issuedDate
      ? new Date(cert.issuedDate).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
    validUntil: cert.validUntil
      ? new Date(cert.validUntil).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
  }))
}

export function CertificationsList() {
  const { t } = useLanguage()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const PAGE_SIZE = 50

  const fetchCertificates = useCallback(async (pageToLoad: number = 0) => {
    setLoading(true)
    setError(null)
    try {
      const result = await certificateService.getAllCertificatesForAdmin(pageToLoad, PAGE_SIZE)
      setCertificates(formatCertificateDates(result.content))
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
      setPage(result.page)
    } catch (err: any) {
      setError(err.message || t('certifications.toasts.error_fetch'))
      console.error("Error fetching certificates:", err)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCertificates(0)
  }, [fetchCertificates])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Certificate>({
    data: certificates,
    searchKeys: ["studentName", "studentEmail", "course"],
  })

  const columns: ColumnDef<Certificate>[] = useMemo(
    () => [
      {
        accessorKey: "studentName",
        header: t('certifications.list.header_students'),
        cell: ({ row }) => {
          const cert = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {cert.studentName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {cert.studentName}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {cert.studentEmail}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "course",
        header: t('certifications.list.header_course'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "issuedDate",
        header: t('certifications.list.header_issued'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.issuedDate}
          </div>
        ),
      },
      {
        accessorKey: "validUntil",
        header: t('certifications.list.header_validity'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-muted-foreground" />
            {row.original.validUntil}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t('certifications.list.header_status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: t('certifications.list.header_actions'),
        cell: ({ row }) => {
          const cert = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Télécharger",
                  icon: <Download className="h-4 w-4" />,
                  onClick: () => {
                    if (cert.certificateUrl) {
                      certificateService.downloadCertificate(cert.certificateUrl)
                    }
                  },
                },
              ]}
            />
          )
        },
      },
    ],
    [t]
  )

  return (
    <>
      <PageHeader title={t('certifications.list.title')} />

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <>
              <div className="mb-4">
                <SearchBar
                  placeholder={t('certifications.list.search_placeholder')}
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              {certificates.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  {t('certifications.list.empty')}
                </div>
              ) : (
                <>
                  <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {totalElements} certificat{totalElements > 1 ? "s" : ""} — page {page + 1} / {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 0 || loading} onClick={() => fetchCertificates(page - 1)}>
                          Précédent
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages - 1 || loading} onClick={() => fetchCertificates(page + 1)}>
                          Suivant
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
