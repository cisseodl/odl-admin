"use client"

import { useState } from "react"
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

export default function BadgesPage() {
  const addModal = useModal<Badge>()
  const viewModal = useModal<Badge>()
  const editModal = useModal<Badge>()
  const deleteModal = useModal<Badge>()

  const [badges, setBadges] = useState<Badge[]>([
    {
      id: 1,
      name: "Premier Pas",
      description: "Complétez votre première formation",
      type: "completion",
      icon: "🎯",
      color: "bg-blue-500",
      criteria: {
        type: "completion",
        minCourses: 1,
      },
      enabled: true,
      createdAt: "2024-01-15T10:00:00Z",
      awardedCount: 1250,
    },
    {
      id: 2,
      name: "Expert",
      description: "Obtenez un score de 90% ou plus",
      type: "score",
      icon: "⭐",
      color: "bg-yellow-500",
      criteria: {
        type: "score",
        minScore: 90,
      },
      enabled: true,
      createdAt: "2024-01-15T10:00:00Z",
      awardedCount: 450,
    },
    {
      id: 3,
      name: "Assidu",
      description: "Connectez-vous 30 jours consécutifs",
      type: "streak",
      icon: "🔥",
      color: "bg-orange-500",
      criteria: {
        type: "streak",
        consecutiveDays: 30,
      },
      enabled: true,
      createdAt: "2024-01-15T10:00:00Z",
      awardedCount: 320,
    },
  ])

  // Données simulées pour les statistiques
  const [awards] = useState<BadgeAward[]>([
    { id: 1, badgeId: 1, userId: 1, awardedAt: "2024-01-20T10:00:00Z" },
    { id: 2, badgeId: 2, userId: 2, awardedAt: "2024-01-21T10:00:00Z" },
    { id: 3, badgeId: 1, userId: 3, awardedAt: "2024-01-22T10:00:00Z" },
  ])

  const handleAddBadge = (data: BadgeFormData) => {
    const newBadge: Badge = {
      id: badges.length + 1,
      ...data,
      criteria: {
        ...data.criteria,
        type: data.type,
      },
      createdAt: new Date().toISOString(),
      awardedCount: 0,
    }
    setBadges([...badges, newBadge])
  }

  const handleUpdateBadge = (data: BadgeFormData) => {
    if (editModal.selectedItem) {
      setBadges(
        badges.map((badge) =>
          badge.id === editModal.selectedItem!.id
            ? {
                ...badge,
                ...data,
                criteria: {
                  ...data.criteria,
                  type: data.type,
                },
                updatedAt: new Date().toISOString(),
              }
            : badge
        )
      )
    }
  }

  const handleDeleteBadge = () => {
    if (deleteModal.selectedItem) {
      setBadges(badges.filter((badge) => badge.id !== deleteModal.selectedItem!.id))
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
      header: "Badge",
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
                    Inactif
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
      header: "Type",
      cell: ({ row }) => {
        const typeLabels = {
          completion: "Complétion",
          score: "Score",
          participation: "Participation",
          time: "Temps",
          streak: "Série",
        }
        return (
          <div className="flex items-center gap-2">
            {getTypeIcon(row.original.type)}
            <span>{typeLabels[row.original.type]}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "criteria",
      header: "Critères",
      cell: ({ row }) => {
        const badge = row.original
        const criteria = badge.criteria
        let criteriaText = ""

        if (criteria.type === "completion") {
          criteriaText = `${criteria.minCourses || criteria.threshold || 1} formation(s)`
        } else if (criteria.type === "score") {
          criteriaText = `Score ≥ ${criteria.minScore || criteria.threshold || 0}%`
        } else if (criteria.type === "participation" || criteria.type === "streak") {
          criteriaText = `${criteria.consecutiveDays || criteria.threshold || 1} jour(s) consécutif(s)`
        } else if (criteria.type === "time") {
          criteriaText = `${criteria.timeSpent || criteria.threshold || 0}h de temps passé`
        }

        return <span className="text-sm">{criteriaText}</span>
      },
    },
    {
      accessorKey: "awardedCount",
      header: "Attributions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.awardedCount || 0}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const badge = row.original
        return (
          <ActionMenu
            actions={[
              {
                label: "Voir détails",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => viewModal.open(badge),
              },
              {
                label: "Modifier",
                icon: <Edit className="h-4 w-4" />,
                onClick: () => editModal.open(badge),
              },
              {
                label: "Supprimer",
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
          title="Badges"
          description="Gérez les badges et récompenses de gamification"
          action={{
            label: "Créer un badge",
            onClick: () => addModal.open(),
          }}
        />

        <BadgeStats badges={badges} awards={awards} totalUsers={12543} />

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <SearchBar placeholder="Rechercher un badge..." value={searchQuery} onChange={setSearchQuery} />
            </div>
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          </CardContent>
        </Card>
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
        title="Supprimer le badge"
        description={`Êtes-vous sûr de vouloir supprimer le badge "${deleteModal.selectedItem?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}

