"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Download, Award, BookOpen, Calendar, User, Mail } from "lucide-react"

type Certificate = {
  id: number
  studentName: string
  studentEmail: string
  course: string
  issuedDate: string
  validUntil: string
  status: "Valide" | "Expiré"
  avatar?: string
}

export function CertificatesManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: 1,
      studentName: "Marie Dupont",
      studentEmail: "marie.dupont@email.com",
      course: "Formation React Avancé",
      issuedDate: "15 Jan 2024",
      validUntil: "15 Jan 2025",
      status: "Valide",
      avatar: "/diverse-woman-portrait.png",
    },
    {
      id: 2,
      studentName: "Thomas Martin",
      studentEmail: "thomas.martin@email.com",
      course: "Formation Node.js Complet",
      issuedDate: "20 Fév 2024",
      validUntil: "20 Fév 2025",
      status: "Valide",
      avatar: "/man.jpg",
    },
    {
      id: 3,
      studentName: "Sophie Bernard",
      studentEmail: "sophie.bernard@email.com",
      course: "Formation React Avancé",
      issuedDate: "10 Mar 2023",
      validUntil: "10 Mar 2024",
      status: "Expiré",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Certificate>({
    data: certificates,
    searchKeys: ["studentName", "studentEmail", "course"],
  })

  const columns: ColumnDef<Certificate>[] = useMemo(
    () => [
      {
        accessorKey: "studentName",
        header: "Apprenant",
        cell: ({ row }) => {
          const cert = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={cert.avatar || "/placeholder.svg"} alt={cert.studentName} />
                <AvatarFallback>{cert.studentName.slice(0, 2)}</AvatarFallback>
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
        header: "Formation",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "issuedDate",
        header: "Date d'émission",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.issuedDate}
          </div>
        ),
      },
      {
        accessorKey: "validUntil",
        header: "Valide jusqu'au",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-muted-foreground" />
            {row.original.validUntil}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const cert = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => console.log("View", cert),
                },
                {
                  label: "Télécharger",
                  icon: <Download className="h-4 w-4" />,
                  onClick: () => console.log("Download", cert),
                },
              ]}
            />
          )
        },
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        title="Certificats"
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher un certificat..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
        </CardContent>
      </Card>
    </>
  )
}
