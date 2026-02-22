"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSearch } from "@/hooks/use-search"
import { useLanguage } from "@/contexts/language-context"
import { certificateService, Certificate } from "@/services/certificate.service"
import { PageLoader } from "@/components/ui/page-loader"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Download, Award, BookOpen, Calendar, User, Mail } from "lucide-react"

export default function AdminAttestationsPage() {
  const { t } = useLanguage()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await certificateService.getAllCertificatesForAdmin()
        const formatted = data.map((cert) => ({
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
        setCertificates(formatted)
      } catch (err: unknown) {
        console.error("Failed to load attestations:", err)
        setError(err instanceof Error ? err.message : "Failed to load attestations.")
      } finally {
        setLoading(false)
      }
    }
    fetchCertificates()
  }, [])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Certificate>({
    data: certificates,
    searchKeys: ["studentName", "studentEmail", "course"],
  })

  const columns: ColumnDef<Certificate>[] = useMemo(
    () => [
      {
        accessorKey: "studentName",
        header: t("attestation.list.apprenant") ?? "Apprenant",
        cell: ({ row }) => {
          const cert = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(cert.studentName || "?").slice(0, 2).toUpperCase()}
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
        header: t("attestation.list.formation") ?? "Formation",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "issuedDate",
        header: t("attestation.list.issued") ?? "Date d'émission",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.issuedDate}
          </div>
        ),
      },
      {
        accessorKey: "validUntil",
        header: t("attestation.list.valid_until") ?? "Valide jusqu'au",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-muted-foreground" />
            {row.original.validUntil}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("attestation.list.status") ?? "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: t("attestation.list.actions") ?? "Actions",
        cell: ({ row }) => {
          const cert = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t("attestation.list.view") ?? "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => {},
                },
                {
                  label: t("attestation.list.download") ?? "Télécharger",
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
      <PageHeader
        title={t("routes.attestation") ?? "Attestation"}
        description={t("attestation.description") ?? "Liste des apprenants ayant obtenu leur certification."}
      />
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
                  placeholder={t("attestation.search") ?? "Rechercher un apprenant certifié..."}
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              {certificates.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                  {t("attestation.empty") ?? "Aucun certificat délivré."}
                </div>
              ) : (
                <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
