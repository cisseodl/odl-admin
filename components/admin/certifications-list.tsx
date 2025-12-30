"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { CertificationFormModal } from "@/components/shared/certification-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewCertificationModal } from "./modals/view-certification-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Award, BookOpen, Users, Calendar } from "lucide-react"
import type { CertificationFormData } from "@/lib/validations/certification"

type Certification = {
  id: number
  name: string
  course: string
  issued: number
  validUntil: string
  status: "Actif" | "Expiré" | "En attente"
  requirements: string
}

export function CertificationsList() {
  const addModal = useModal<Certification>()
  const editModal = useModal<Certification>()
  const deleteModal = useModal<Certification>()
  const viewModal = useModal<Certification>()

  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: 1,
      name: "Certification React Avancé",
      course: "Formation React Avancé",
      issued: 145,
      validUntil: "31 Déc 2025",
      status: "Actif",
      requirements: "80% de réussite minimum",
    },
    {
      id: 2,
      name: "Certification Full Stack Developer",
      course: "Formation Full Stack",
      issued: 89,
      validUntil: "15 Jan 2026",
      status: "Actif",
      requirements: "Projet final validé",
    },
    {
      id: 3,
      name: "Certification UI/UX Design",
      course: "Formation Design UI/UX",
      issued: 203,
      validUntil: "20 Nov 2024",
      status: "Expiré",
      requirements: "Portfolio de 5 projets",
    },
    {
      id: 4,
      name: "Certification Data Science",
      course: "Formation Data Science",
      issued: 67,
      validUntil: "10 Mar 2026",
      status: "Actif",
      requirements: "Examen final + projet",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Certification>({
    data: certifications,
    searchKeys: ["name", "course"],
  })

  const handleAddCertification = (data: CertificationFormData) => {
    const newCertification: Certification = {
      id: certifications.length + 1,
      ...data,
      issued: 0,
    }
    setCertifications([...certifications, newCertification])
  }

  const handleUpdateCertification = (data: CertificationFormData) => {
    if (editModal.selectedItem) {
      setCertifications(
        certifications.map((cert) =>
          cert.id === editModal.selectedItem!.id
            ? { ...cert, ...data }
            : cert
        )
      )
    }
  }

  const handleDeleteCertification = () => {
    if (deleteModal.selectedItem) {
      setCertifications(certifications.filter((cert) => cert.id !== deleteModal.selectedItem!.id))
    }
  }

  const columns: ColumnDef<Certification>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Certification",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: "Formation associée",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "issued",
        header: "Délivrés",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.issued}
          </div>
        ),
      },
      {
        accessorKey: "validUntil",
        header: "Validité",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
          const certification = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(certification),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(certification),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(certification),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title="Certifications"
        action={{
          label: "Créer une certification",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher une certification..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
        </CardContent>
      </Card>

      <CertificationFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Créer une certification"
        description="Créez une nouvelle certification pour la plateforme"
        onSubmit={handleAddCertification}
        submitLabel="Créer la certification"
      />

      {editModal.selectedItem && (
        <CertificationFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la certification"
          description="Modifiez les informations de la certification"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCertification}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewCertificationModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          certification={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteCertification}
        title="Supprimer la certification"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
