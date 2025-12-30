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
import { ContentFormModal } from "@/components/shared/content-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/admin/empty-state"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, FileText, Video, Image, FileQuestion, File, Calendar, Clock, HardDrive, Upload } from "lucide-react"
import type { ContentFormData } from "@/lib/validations/content"

type Content = {
  id: number
  title: string
  type: "Vidéo" | "Document" | "Image" | "Quiz" | "Fichier"
  course: string
  module?: string
  duration?: string
  size?: string
  uploadDate: string
  status: "Publié" | "Brouillon"
}

export function ContentManager() {
  const addModal = useModal<Content>()
  const editModal = useModal<Content>()
  const deleteModal = useModal<Content>()

  const [content, setContent] = useState<Content[]>([])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Content>({
    data: content,
    searchKeys: ["title", "course", "type"],
  })

  const handleAddContent = (data: ContentFormData) => {
    const newContent: Content = {
      id: content.length + 1,
      ...data,
      uploadDate: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    }
    setContent([...content, newContent])
  }

  const handleUpdateContent = (data: ContentFormData) => {
    if (editModal.selectedItem) {
      setContent(
        content.map((item) =>
          item.id === editModal.selectedItem!.id ? { ...editModal.selectedItem, ...data } : item
        )
      )
    }
  }

  const handleDeleteContent = () => {
    if (deleteModal.selectedItem) {
      setContent(content.filter((item) => item.id !== deleteModal.selectedItem!.id))
    }
  }

  const getTypeIcon = (type: Content["type"]) => {
    switch (type) {
      case "Vidéo":
        return <Video className="h-4 w-4" />
      case "Document":
        return <FileText className="h-4 w-4" />
      case "Image":
        return <Image className="h-4 w-4" />
      case "Quiz":
        return <FileQuestion className="h-4 w-4" />
      case "Fichier":
        return <File className="h-4 w-4" />
    }
  }

  const columns: ColumnDef<Content>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titre",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            {getTypeIcon(row.original.type)}
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "course",
        header: "Formation",
      },
      {
        accessorKey: "module",
        header: "Module",
        cell: ({ row }) => row.original.module || "-",
      },
      {
        accessorKey: "duration",
        header: "Durée",
        cell: ({ row }) =>
          row.original.duration ? (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {row.original.duration}
            </div>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "size",
        header: "Taille",
        cell: ({ row }) =>
          row.original.size ? (
            <div className="flex items-center gap-1">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              {row.original.size}
            </div>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "uploadDate",
        header: "Date d'upload",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.uploadDate}
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
          const item = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(item),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(item),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title="Mes Contenus"
        description="Gérez vos contenus pédagogiques"
        action={{
          label: "Uploader du contenu",
          icon: <Upload className="h-4 w-4" />,
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher du contenu..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {filteredData.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucun contenu"
              description="Commencez par uploader du contenu"
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <ContentFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Uploader du contenu"
        description="Ajoutez un nouveau contenu à votre formation"
        onSubmit={handleAddContent}
        submitLabel="Uploader"
      />

      {editModal.selectedItem && (
        <ContentFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier le contenu"
          description="Modifiez les informations du contenu"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateContent}
          submitLabel="Enregistrer les modifications"
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteContent}
        title="Supprimer le contenu"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.title} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
