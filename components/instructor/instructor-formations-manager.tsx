"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Plus, GraduationCap } from "lucide-react"
import { Formation, Categorie } from "@/models"
import { formationService, categorieService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { FormationFormModal } from "@/components/shared/formation-form-modal"
import type { FormationFormData } from "@/lib/validations/formation"

type FormationDisplay = {
  id: number
  title: string
  description?: string | null
  imagePath?: string | null
  categorie?: Categorie | null
  categorie_id?: number | null
  activate: boolean
  createdAt?: Date | null
}

const mapFormationToDisplay = (formation: Formation): FormationDisplay => {
  return {
    id: formation.id || 0,
    title: formation.title || "Sans titre",
    description: formation.description || null,
    imagePath: formation.imagePath || null,
    categorie: formation.categorie || null,
    categorie_id: formation.categorie_id || (formation.categorie?.id || null),
    activate: formation.activate ?? true,
    createdAt: formation.createdAt || null,
  }
}

export function InstructorFormationsManager() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const addModal = useModal<FormationDisplay>()
  const editModal = useModal<FormationDisplay>()

  const [formations, setFormations] = useState<FormationDisplay[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFormations = async () => {
    setLoading(true)
    setError(null)
    try {
      const formationsData = await formationService.getAllFormations()
      if (Array.isArray(formationsData)) {
        setFormations(formationsData.map(mapFormationToDisplay))
      } else {
        setFormations([])
        console.warn("Formations data is not an array:", formationsData)
      }
    } catch (err: any) {
      setError(err.message || "Impossible de charger les formations.")
      console.error("Error fetching formations:", err)
      setFormations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesData = await categorieService.getAllCategories()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (err: any) {
      console.error("Error fetching categories:", err)
    }
  }

  useEffect(() => {
    fetchFormations()
    fetchCategories()
  }, [])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<FormationDisplay>({
    data: formations,
    searchKeys: ["title", "description"],
  })

  const handleAddFormation = async (data: FormationFormData) => {
    setError(null)
    try {
      const createdFormation = await formationService.createFormation({
        title: data.title,
        description: data.description,
        imagePath: data.imagePath,
        categorieId: data.categorieId,
        activate: data.activate ?? true,
      })
      setFormations((prev) => [...prev, mapFormationToDisplay(createdFormation as Formation)])
      addModal.close()
      toast({
        title: "Succès",
        description: "La formation a été créée avec succès.",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Impossible de créer la formation."
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleUpdateFormation = async (data: FormationFormData) => {
    if (!editModal.selectedItem) return
    setError(null)
    try {
      const updatedFormation = await formationService.updateFormation(editModal.selectedItem.id, {
        title: data.title,
        description: data.description,
        imagePath: data.imagePath,
        categorieId: data.categorieId,
        activate: data.activate,
      })
      setFormations((prev) =>
        prev.map((formation) =>
          formation.id === editModal.selectedItem!.id ? mapFormationToDisplay(updatedFormation as Formation) : formation
        )
      )
      editModal.close()
      toast({
        title: "Succès",
        description: "La formation a été mise à jour avec succès.",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Impossible de mettre à jour la formation."
      setError(errorMessage)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<FormationDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titre",
        cell: ({ row }) => {
          const formation = row.original
          if (!formation) {
            return null
          }
          const title = formation.title || "Sans titre"
          return (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{title}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const formation = row.original
          if (!formation) {
            return null
          }
          const description = formation.description
          return (
            <div className="max-w-md truncate text-sm text-muted-foreground">
              {description || "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "categorie",
        header: "Catégorie",
        cell: ({ row }) => {
          const formation = row.original
          if (!formation) {
            return null
          }
          const categorie = formation.categorie
          return (
            <div className="text-sm">
              {categorie?.title || "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "activate",
        header: "Statut",
        cell: ({ row }) => {
          const formation = row.original
          if (!formation) {
            return null
          }
          const activate = formation.activate ?? true
          return <StatusBadge status={activate ? "active" : "inactive"} />
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const formation = row.original
          if (!formation) {
            return null
          }
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => editModal.open(formation),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(formation),
                },
              ]}
            />
          )
        },
      },
    ],
    [editModal]
  )

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("routes.instructor_formations") || "Formations" || ""}
        description="Gérez vos formations pédagogiques. Les formations organisent vos cours par domaine de compétence."
        action={{
          label: "Ajouter une formation",
          onClick: () => addModal.open(),
        }}
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une formation..."
        />
      </div>

      {!filteredData || filteredData.length === 0 ? (
        <EmptyState
          title="Aucune formation"
          description="Créez votre première formation pour organiser vos cours par domaine de compétence."
          action={
            <Button onClick={() => addModal.open()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une formation
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredData || []} />
      )}

      <FormationFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter une formation"
        description="Créez une nouvelle formation pour organiser vos cours par domaine de compétence"
        onSubmit={handleAddFormation}
        submitLabel="Créer"
        categories={categories}
      />

      {editModal.selectedItem && (
        <FormationFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la formation"
          description="Mettez à jour les informations de la formation"
          defaultValues={{
            title: editModal.selectedItem.title || "",
            description: editModal.selectedItem.description || undefined,
            imagePath: editModal.selectedItem.imagePath || undefined,
            categorieId: editModal.selectedItem.categorie_id || undefined,
            activate: editModal.selectedItem.activate ?? true,
          }}
          onSubmit={handleUpdateFormation}
          submitLabel="Enregistrer"
          categories={categories}
        />
      )}
    </div>
  )
}

