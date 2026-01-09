"use client"

import { useState, useEffect } from "react" // Added useEffect
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

import { notificationsService } from "@/services"; // Import notificationsService
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader


export function AnnouncementManager() {
  const addModal = useModal<Announcement>()
  const viewModal = useModal<Announcement>()
  const editModal = useModal<Announcement>()
  const deleteModal = useModal<Announcement>()

  const [announcements, setAnnouncements] = useState<Announcement[]>([]); // Initialiser vide
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await notificationsService.getAllAnnouncements();
        setAnnouncements(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch announcements.");
        console.error("Error fetching announcements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []); // Exécuter une fois au montage

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Announcement>({
    data: announcements,
    searchKeys: ["title", "content"],
  })

  const handleAddAnnouncement = async (data: Omit<Announcement, "id" | "createdAt" | "readCount" | "totalRecipients" | "sentAt" | "status">) => {
    setError(null);
    try {
      // Les champs id, createdAt, readCount, totalRecipients, sentAt, status sont gérés par le backend
      const createdAnnouncement = await notificationsService.createAnnouncement({
        title: data.title,
        content: data.content,
        targetAudience: data.targetAudience,
        scheduledAt: data.scheduledAt,
      });
      setAnnouncements((prev) => [...prev, createdAnnouncement]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add announcement.");
      console.error("Error adding announcement:", err);
    }
  }

  const handleUpdateAnnouncement = async (data: Omit<Announcement, "id" | "createdAt" | "readCount" | "totalRecipients">) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedAnnouncement = await notificationsService.updateAnnouncement(editModal.selectedItem.id, {
          title: data.title,
          content: data.content,
          targetAudience: data.targetAudience,
          scheduledAt: data.scheduledAt,
          // Le statut et sentAt ne sont pas mis à jour via le formulaire d'édition ici
        });
        setAnnouncements((prev) =>
          prev.map((announcement) =>
            announcement.id === editModal.selectedItem!.id
              ? updatedAnnouncement
              : announcement
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update announcement.");
        console.error("Error updating announcement:", err);
      }
    }
  }

  const handleDeleteAnnouncement = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await notificationsService.deleteAnnouncement(deleteModal.selectedItem.id);
        setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete announcement.");
        console.error("Error deleting announcement:", err);
      }
    }
  }

  const handleSendNow = async (id: number) => {
    setError(null);
    try {
      await notificationsService.sendAnnouncement(id);
      // Après l'envoi, rafraîchir la liste ou mettre à jour l'état local
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === id
            ? {
                ...announcement,
                status: "sent",
                sentAt: new Date().toISOString(),
                // readCount et totalRecipients peuvent être mis à jour par le backend
              }
            : announcement
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to send announcement.");
      console.error("Error sending announcement:", err);
    }
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
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <>
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher une annonce..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              {announcements.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">Aucune annonce trouvée.</div>
              ) : (
                <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals remain the same */}
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

