"use client"

import { useState, useEffect } from "react" // Added useEffect
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { BadgeFormModal } from "@/components/admin/badges/badge-form-modal"
import { BadgeStats } from "@/components/admin/badges/badge-stats"
import { BadgePreview } from "@/components/admin/badges/badge-preview"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Award, Star, Target, Clock, Users } from "lucide-react"
import { Badge as BadgeComponent } from "@/components/ui/badge"
import type { Badge, BadgeAward } from "@/types/gamification"
import type { BadgeFormData } from "@/lib/validations/badge"

import { gamificationService } from "@/services"; // Import gamificationService
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader


export default function BadgesPage() {
  const { t } = useLanguage()
  const addModal = useModal<Badge>()
  const viewModal = useModal<Badge>()
  const editModal = useModal<Badge>()
  const deleteModal = useModal<Badge>()

  const [badges, setBadges] = useState<Badge[]>([]); // Initialiser vide
  const [awards, setAwards] = useState<BadgeAward[]>([]); // Initialiser vide pour les awards
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadgesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedBadges = await gamificationService.getAllBadges();
        const fetchedAwards = await gamificationService.getBadgeAwards();
        setBadges(fetchedBadges);
        setAwards(fetchedAwards);
      } catch (err: any) {
        setError(err.message || "Failed to fetch badges data.");
        console.error("Error fetching badges data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadgesData();
  }, []); // Exécuter une fois au montage

  const handleAddBadge = async (data: BadgeFormData) => {
    setError(null);
    try {
      // Les champs id, createdAt, awardedCount sont gérés par le backend
      const newBadge: Omit<Badge, 'id' | 'createdAt' | 'awardedCount'> = {
        name: data.name,
        description: data.description,
        type: data.type,
        icon: data.icon,
        color: data.color,
        criteria: {
          ...data.criteria,
          type: data.type, // Ensure criteria type matches badge type
        },
        enabled: data.enabled,
      };
      const createdBadge = await gamificationService.createBadge(newBadge);
      setBadges((prev) => [...prev, createdBadge]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add badge.");
      console.error("Error adding badge:", err);
    }
  }

  const handleUpdateBadge = async (data: BadgeFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedBadgeData: Partial<Badge> = {
          name: data.name,
          description: data.description,
          type: data.type,
          icon: data.icon,
          color: data.color,
          criteria: {
            ...data.criteria,
            type: data.type,
          },
          enabled: data.enabled,
          // createdAt et awardedCount ne sont pas mis à jour par le formulaire d'édition
        };
        const updatedBadge = await gamificationService.updateBadge(editModal.selectedItem.id, updatedBadgeData);
        setBadges((prev) =>
          prev.map((badge) =>
            badge.id === editModal.selectedItem!.id
              ? updatedBadge
              : badge
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update badge.");
        console.error("Error updating badge:", err);
      }
    }
  }

  const handleDeleteBadge = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await gamificationService.deleteBadge(deleteModal.selectedItem.id);
        setBadges((prev) => prev.filter((badge) => badge.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete badge.");
        console.error("Error deleting badge:", err);
      }
    }
  }

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Badge>({
    data: badges,
    searchKeys: ["name", "description"],
  })

  const getTypeIcon = (type: Badge["type"]) => {
    switch (type) {
      case "completion":
        return <Target className="h-4 w-4" />
      case "score":
        return <Star className="h-4 w-4" />
      case "participation":
        return <Award className="h-4 w-4" />
      case "time":
        return <Clock className="h-4 w-4" />
    }
  }

  const columns: ColumnDef<Badge>[] = [
    {
      accessorKey: "name",
      header: t('badges.header_badge'),
      cell: ({ row }) => {
        const badge = row.original
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${badge.color} text-white text-xl`}>
              {badge.icon}
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {badge.name}
                {!badge.enabled && (
                  <BadgeComponent variant="secondary" className="text-xs">
                    {t('badges.status_inactive')}
                  </BadgeComponent>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{badge.description}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: t('badges.header_type'),
      cell: ({ row }) => {
        const typeLabels: Record<string, string> = {
          completion: t('badges.typeLabels.completion'),
          score: t('badges.typeLabels.score'),
          participation: t('badges.typeLabels.participation'),
          time: t('badges.typeLabels.time'),
          streak: t('badges.typeLabels.streak'),
        }
        return (
          <div className="flex items-center gap-2">
            {getTypeIcon(row.original.type)}
            <span>{typeLabels[row.original.type] || row.original.type}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "criteria",
      header: t('badges.header_criteria'),
      cell: ({ row }) => {
        const badge = row.original
        const criteria = badge.criteria
        let criteriaText = ""

        if (criteria.type === "completion") {
          criteriaText = t('badges.criteria.completion').replace('{{count}}', String(criteria.minCourses || criteria.threshold || 1))
        } else if (criteria.type === "score") {
          criteriaText = t('badges.criteria.score').replace('{{score}}', String(criteria.minScore || criteria.threshold || 0))
        } else if (criteria.type === "participation" || criteria.type === "streak") {
          criteriaText = t('badges.criteria.participation').replace('{{days}}', String(criteria.consecutiveDays || criteria.threshold || 1))
        } else if (criteria.type === "time") {
          criteriaText = t('badges.criteria.time').replace('{{hours}}', String(criteria.timeSpent || criteria.threshold || 0))
        }

        return <span className="text-sm">{criteriaText}</span>
      },
    },
    {
      accessorKey: "awardedCount",
      header: t('badges.header_attributions'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.awardedCount || 0}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: t('badges.header_actions'),
      cell: ({ row }) => {
        const badge = row.original
        return (
          <ActionMenu
            actions={[
              {
                label: t('badges.action_view'),
                icon: <Eye className="h-4 w-4" />,
                onClick: () => viewModal.open(badge),
              },
              {
                label: t('badges.action_edit'),
                icon: <Edit className="h-4 w-4" />,
                onClick: () => editModal.open(badge),
              },
              {
                label: t('badges.action_delete'),
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => deleteModal.open(badge),
                variant: "destructive",
              },
            ]}
          />
        )
      },
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={t('badges.title')}
          description={t('badges.description')}
          action={{
            label: t('badges.create_button'),
            onClick: () => addModal.open(),
          }}
        />

        {loading ? (
            <PageLoader />
        ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
        ) : (
            <>
                <BadgeStats badges={badges} awards={awards} totalUsers={12543} /> {/* totalUsers reste statique */}

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-4">
                            <SearchBar placeholder={t('badges.search_placeholder')} value={searchQuery} onChange={setSearchQuery} />
                        </div>
                        {badges.length === 0 ? (
                            <div className="text-center text-muted-foreground p-4">{t('badges.empty')}</div>
                        ) : (
                            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
                        )}
                    </CardContent>
                </Card>
            </>
        )}
      </div>

      <BadgeFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        onSubmit={handleAddBadge}
      />

      {editModal.selectedItem && (
        <BadgeFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          badge={editModal.selectedItem}
          onSubmit={handleUpdateBadge}
        />
      )}

      {viewModal.selectedItem && (
        <Dialog open={viewModal.isOpen} onOpenChange={(open) => !open && viewModal.close()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold leading-tight">Détails du badge</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Informations complètes sur le badge
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <BadgePreview
                name={viewModal.selectedItem.name}
                description={viewModal.selectedItem.description}
                icon={viewModal.selectedItem.icon}
                color={viewModal.selectedItem.color}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{viewModal.selectedItem.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <BadgeComponent variant={viewModal.selectedItem.enabled ? "default" : "secondary"}>
                    {viewModal.selectedItem.enabled ? "Actif" : "Inactif"}
                  </BadgeComponent>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attributions</p>
                  <p className="font-medium">{viewModal.selectedItem.awardedCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="font-medium">
                    {new Date(viewModal.selectedItem.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteBadge}
        title={t('badges.delete.title')}
        description={t('badges.delete.description').replace('{{name}}', deleteModal.selectedItem?.name || '')}
        confirmText={t('badges.delete_confirm')}
        variant="destructive"
      />
    </>
  )
}
