"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { AnnouncementFormModal } from "./announcement-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Send, Calendar, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Announcement } from "@/types/notifications"

export function AnnouncementManager() {
  const addModal = useModal<Announcement>()
  const viewModal = useModal<Announcement>()
  const editModal = useModal<Announcement>()
  const deleteModal = useModal<Announcement>()

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Nouvelle formation React disponible",
      content: "Découvrez notre nouvelle formation React Avancé avec des concepts modernes.",
      targetAudience: "all",
      scheduledAt: undefined,
      sentAt: "2024-01-15T10:00:00Z",
      readCount: 1250,
      totalRecipients: 12543,
      status: "sent",
      createdAt: "2024-01-15T09:00:00Z",
    },
    {
      id: 2,
      title: "Maintenance programmée",
      content: "Une maintenance est prévue le 20 janvier de 2h à 4h du matin.",
      targetAudience: "all",
      scheduledAt: "2024-01-20T02:00:00Z",
      sentAt: undefined,
      readCount: 0,
      totalRecipients: 12543,
      status: "scheduled",
      createdAt: "2024-01-16T10:00:00Z",
    },
    {
      id: 3,
      title: "Nouveaux badges disponibles",
      content: "De nouveaux badges ont été ajoutés à la plateforme.",
      targetAudience: "student",
      scheduledAt: undefined,
      sentAt: undefined,
      readCount: 0,
      totalRecipients: 0,
      status: "draft",
      createdAt: "2024-01-17T14:00:00Z",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Announcement>({
    data: announcements,
    searchKeys: ["title", "content"],
  })

  const handleAddAnnouncement = (data: Omit<Announcement, "id" | "createdAt" | "readCount" | "totalRecipients">) => {
    const newAnnouncement: Announcement = {
      ...data,
      id: announcements.length + 1,
      readCount: 0,
      totalRecipients: 0,
      createdAt: new Date().toISOString(),
    }
    setAnnouncements([...announcements, newAnnouncement])
  }

  const handleUpdateAnnouncement = (data: Omit<Announcement, "id" | "createdAt" | "readCount" | "totalRecipients">) => {
    if (editModal.selectedItem) {
      setAnnouncements(
        announcements.map((announcement) =>
          announcement.id === editModal.selectedItem!.id
            ? {
                ...announcement,
                ...data,
              }
            : announcement
        )
      )
    }
  }

  const handleDeleteAnnouncement = () => {
    if (deleteModal.selectedItem) {
      setAnnouncements(announcements.filter((announcement) => announcement.id !== deleteModal.selectedItem!.id))
    }
  }

  const handleSendNow = (id: number) => {
    setAnnouncements(
      announcements.map((announcement) =>
        announcement.id === id
          ? {
              ...announcement,
              status: "sent" as const,
              sentAt: new Date().toISOString(),
              totalRecipients: 12543, // Simulé
            }
          : announcement
      )
    )
  }

  const getAudienceLabel = (audience: Announcement["targetAudience"]) => {
    const labels = {
      all: "Tous",
      admin: "Administrateurs",
      instructor: "Instructeurs",
      student: "Étudiants",
    }
    return labels[audience]
  }

  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{row.original.content}</div>
        </div>
      ),
    },
    {
      accessorKey: "targetAudience",
      header: "Cible",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          {getAudienceLabel(row.original.targetAudience)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "scheduledAt",
      header: "Programmé",
      cell: ({ row }) => {
        const announcement = row.original
        if (announcement.scheduledAt) {
          return (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {new Date(announcement.scheduledAt).toLocaleDateString("fr-FR")}
            </div>
          )
        }
        return <span className="text-muted-foreground text-sm">-</span>
      },
    },
    {
      accessorKey: "readCount",
      header: "Statistiques",
      cell: ({ row }) => {
        const announcement = row.original
        if (announcement.status === "sent") {
          const readRate =
            announcement.totalRecipients > 0
              ? ((announcement.readCount / announcement.totalRecipients) * 100).toFixed(1)
              : "0"
          return (
            <div className="text-sm">
              <div>{announcement.readCount.toLocaleString("fr-FR")} / {announcement.totalRecipients.toLocaleString("fr-FR")}</div>
              <div className="text-muted-foreground">{readRate}% lu</div>
            </div>
          )
        }
        return <span className="text-muted-foreground text-sm">-</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const announcement = row.original
        const actions = [
          {
            label: "Voir",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => viewModal.open(announcement),
          },
          {
            label: "Modifier",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => editModal.open(announcement),
          },
        ]

        if (announcement.status === "draft" || announcement.status === "scheduled") {
          actions.push({
            label: "Envoyer maintenant",
            icon: <Send className="h-4 w-4" />,
            onClick: () => handleSendNow(announcement.id),
          })
        }

        actions.push({
          label: "Supprimer",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => deleteModal.open(announcement),
          variant: "destructive" as const,
        })

        return <ActionMenu actions={actions} />
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Annonces"
        description="Créez et gérez les annonces pour les utilisateurs"
        action={{
          label: "Créer une annonce",
          onClick: () => addModal.open(),
        }}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher une annonce..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
        </CardContent>
      </Card>

      <AnnouncementFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        onSubmit={handleAddAnnouncement}
      />

      {editModal.selectedItem && (
        <AnnouncementFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          announcement={editModal.selectedItem}
          onSubmit={handleUpdateAnnouncement}
        />
      )}

      {viewModal.selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl m-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">{viewModal.selectedItem.title}</h3>
              <p className="text-muted-foreground mb-4">{viewModal.selectedItem.content}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cible</p>
                  <p className="font-medium">{getAudienceLabel(viewModal.selectedItem.targetAudience)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut</p>
                  <StatusBadge status={viewModal.selectedItem.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteAnnouncement}
        title="Supprimer l'annonce"
        description={`Êtes-vous sûr de vouloir supprimer l'annonce "${deleteModal.selectedItem?.title}" ?`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}

