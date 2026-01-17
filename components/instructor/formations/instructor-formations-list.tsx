"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Clock, Target, Users as UsersIcon, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { RubriqueFormModal } from "@/components/shared/rubrique-form-modal"
import { ApiRubrique, rubriqueService } from "@/services/rubrique.service"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import type { RubriqueFormData } from "@/lib/validations/rubrique"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen } from "lucide-react"

type RubriqueDisplay = {
  id: number
  rubrique: string
  image: string | null
  description: string | null
  objectifs: string | null
  publicCible: string | null
  dureeFormat: string | null
  lien_ressources: string | null
  createdBy?: string
}

const mapApiRubriqueToRubriqueDisplay = (rubrique: ApiRubrique): RubriqueDisplay => {
  return {
    id: rubrique.id,
    rubrique: rubrique.rubrique,
    image: rubrique.image,
    description: rubrique.description,
    objectifs: rubrique.objectifs,
    publicCible: rubrique.public_cible,
    dureeFormat: rubrique.duree_format,
    lien_ressources: rubrique.lien_ressources,
    createdBy: rubrique.created_by,
  }
}

export function InstructorFormationsList() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { user } = useAuth()
  const addModal = useModal<RubriqueDisplay>()
  const editModal = useModal<RubriqueDisplay>()
  const deleteModal = useModal<RubriqueDisplay>()
  const viewModal = useModal<RubriqueDisplay>()

  const [rubriques, setRubriques] = useState<RubriqueDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRubriques = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await rubriqueService.getAllRubriques()
      
      // Le backend retourne CResponse avec structure { ok, data, message }
      let allRubriques: ApiRubrique[] = []
      
      if (response && response.data) {
        allRubriques = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : [])
      } else if (Array.isArray(response)) {
        allRubriques = response
      }
      
      // Filtrer les rubriques créées par l'instructeur connecté
      const instructorRubriques = allRubriques.filter((rubrique: ApiRubrique) => {
        // Si createdBy est un email, comparer avec l'email de l'utilisateur
        // Si createdBy est un ID, comparer avec l'ID de l'utilisateur
        if (user?.email && rubrique.created_by) {
          return rubrique.created_by === user.email || rubrique.created_by === String(user.id)
        }
        return false
      })
      
      setRubriques(instructorRubriques.map(mapApiRubriqueToRubriqueDisplay))
    } catch (err: any) {
      console.error("Error fetching rubriques:", err)
      setError(err.message || t('rubriques.toasts.error_load') || "Impossible de charger les formations.")
      setRubriques([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id || user?.email) {
      fetchRubriques()
    }
  }, [user?.id, user?.email])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<RubriqueDisplay>({
    data: rubriques,
    searchKeys: ["rubrique", "description", "objectifs", "publicCible"],
  })

  const handleAddRubrique = async (data: RubriqueFormData & { imageFile?: File | undefined }) => {
    setError(null)
    try {
      const { imageFile, ...rubriqueData } = data
      const response = await rubriqueService.createRubrique(rubriqueData, imageFile)
      
      if (response && response.data) {
        const newRubrique = mapApiRubriqueToRubriqueDisplay(response.data)
        setRubriques((prev) => [...prev, newRubrique])
        addModal.close()
        toast({
          title: t('rubriques.toasts.success_create') || "Succès",
          description: t('rubriques.toasts.create_success') || "Formation créée avec succès.",
        })
      } else {
        throw new Error("Réponse invalide de l'API")
      }
    } catch (err: any) {
      console.error("Error adding rubrique:", err)
      toast({
        title: t('rubriques.toasts.error_create') || "Erreur",
        description: err.message || t('rubriques.toasts.create_error') || "Impossible de créer la formation.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRubrique = async (data: RubriqueFormData & { imageFile?: File | undefined }) => {
    setError(null)
    if (editModal.selectedItem) {
      try {
        const { imageFile, ...rubriqueData } = data

        const payload: Partial<ApiRubrique> = {
          rubrique: rubriqueData.rubrique,
          description: rubriqueData.description,
          objectifs: rubriqueData.objectifs,
          public_cible: rubriqueData.publicCible,
          duree_format: rubriqueData.dureeFormat,
          lien_ressources: rubriqueData.lienRessources,
          image: rubriqueData.image,
        }

        const response = await rubriqueService.updateRubrique(
          editModal.selectedItem.id,
          payload,
          imageFile
        )
        
        if (response && response.data) {
          const updatedRubrique = mapApiRubriqueToRubriqueDisplay(response.data)
          setRubriques((prev) =>
            prev.map((rubrique) =>
              rubrique.id === editModal.selectedItem!.id ? updatedRubrique : rubrique
            )
          )
          editModal.close()
          toast({
            title: t('rubriques.toasts.success_update') || "Succès",
            description: t('rubriques.toasts.update_success') || "Formation mise à jour avec succès.",
          })
        } else {
          throw new Error("Réponse invalide de l'API")
        }
      } catch (err: any) {
        console.error("Error updating rubrique:", err)
        toast({
          title: t('rubriques.toasts.error_update') || "Erreur",
          description: err.message || t('rubriques.toasts.update_error') || "Impossible de mettre à jour la formation.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteRubrique = async () => {
    setError(null)
    if (deleteModal.selectedItem) {
      try {
        await rubriqueService.deleteRubrique(deleteModal.selectedItem.id)
        setRubriques((prev) => prev.filter((rubrique) => rubrique.id !== deleteModal.selectedItem!.id))
        deleteModal.close()
        toast({
          title: t('rubriques.toasts.success_delete') || "Succès",
          description: t('rubriques.toasts.delete_success') || "Formation supprimée avec succès.",
        })
      } catch (err: any) {
        console.error("Error deleting rubrique:", err)
        toast({
          title: t('rubriques.toasts.error_delete') || "Erreur",
          description: err.message || t('rubriques.toasts.delete_error') || "Impossible de supprimer la formation.",
          variant: "destructive",
        })
      }
    }
  }

  const columns: ColumnDef<RubriqueDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "rubrique",
        header: t('rubriques.list.header_rubrique') || "Formation",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.rubrique}</div>
        ),
      },
      {
        accessorKey: "description",
        header: t('rubriques.form.description') || "Description",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {row.original.description || t('common.none') || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "objectifs",
        header: t('rubriques.form.objectives') || "Objectifs",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {row.original.objectifs || t('common.none') || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "publicCible",
        header: t('rubriques.form.target_audience') || "Public Cible",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {row.original.publicCible || t('common.none') || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "dureeFormat",
        header: t('rubriques.form.duration') || "Durée / Format",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.dureeFormat || t('common.none') || "N/A"}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('common.actions') || "Actions",
        cell: ({ row }) => {
          const rubrique = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('common.view') || "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(rubrique),
                },
                {
                  label: t('common.edit') || "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(rubrique),
                },
                {
                  label: t('common.delete') || "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(rubrique),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [t, viewModal, editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title={t('routes.instructor_formations') || "Formations"}
        action={{
          label: t('rubriques.list.add_button') || "Ajouter une formation",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('rubriques.list.search_placeholder') || "Rechercher une formation..."}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t('rubriques.list.empty_title') || "Aucune formation"}
              description={t('rubriques.list.empty_description') || "Commencez par ajouter une formation"}
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <RubriqueFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title={t('rubriques.modals.add_title') || "Ajouter une formation"}
        description={t('rubriques.modals.add_description') || "Créez une nouvelle formation pour organiser le contenu"}
        onSubmit={handleAddRubrique}
        submitLabel={t('rubriques.modals.add_submit') || "Créer la formation"}
      />

      {editModal.selectedItem && (
        <RubriqueFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('rubriques.modals.edit_title') || "Modifier la formation"}
          description={t('rubriques.modals.edit_description') || "Modifiez les informations de la formation"}
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateRubrique}
          submitLabel={t('rubriques.modals.edit_submit') || "Enregistrer les modifications"}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteRubrique}
        title={t('rubriques.modals.delete_title') || "Supprimer la formation"}
        description={t('rubriques.modals.delete_description', { name: deleteModal.selectedItem?.rubrique }) || `Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.rubrique} ? Cette action est irréversible.`}
        confirmText={t('common.delete') || "Supprimer"}
        variant="destructive"
      />
    </>
  )
}
