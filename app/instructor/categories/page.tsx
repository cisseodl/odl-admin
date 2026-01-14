"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { useModal } from "@/hooks/use-modal"
import { useToast } from "@/hooks/use-toast"
import { useSearch } from "@/hooks/use-search"
import { CategoryFormModal } from "@/components/shared/category-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewCategoryModal } from "@/components/admin/modals/view-category-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Tag, BookOpen, FileText, Plus } from "lucide-react"
import type { CategoryFormData } from "@/lib/validations/category"
import { Categorie } from "@/models"
import { categorieService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { Button } from "@/components/ui/button"

type CategoryDisplay = {
  id: number
  title: string
  description: string
  courses: number
}

// Helper function to map Categorie to CategoryDisplay
const mapCategorieToCategoryDisplay = (categorie: Categorie): CategoryDisplay => ({
  id: categorie.id,
  title: categorie.title,
  description: categorie.description || "",
  courses: 0, // TODO: Get from backend if available
})

export default function InstructorCategoriesPage() {
  const { t } = useLanguage()
  const addModal = useModal<CategoryDisplay>()
  const editModal = useModal<CategoryDisplay>()
  const deleteModal = useModal<CategoryDisplay>()
  const viewModal = useModal<CategoryDisplay>()
  const { toast } = useToast()

  const [categories, setCategories] = useState<CategoryDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await categorieService.getAllCategories()
      const categoriesData = Array.isArray(response) ? response : response?.data || []
      if (categoriesData.length > 0) {
        setCategories(categoriesData.map(mapCategorieToCategoryDisplay))
      } else {
        setCategories([])
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories.")
      toast({
        title: t('common.error'),
        description: t('categories.toasts.error_fetch') || "Erreur lors du chargement des catégories",
        variant: "destructive",
      })
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }, [toast, t])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<CategoryDisplay>({
    data: categories,
    searchKeys: ["title", "description"],
  })

  const handleAddCategory = useCallback(async (data: CategoryFormData) => {
    try {
      const newCategoryData = {
        title: data.title,
        description: data.description || "",
      }
      const createdCategory = await categorieService.createCategorie(newCategoryData)
      setCategories((prev) => [...prev, mapCategorieToCategoryDisplay(createdCategory)])
      addModal.close()
      toast({
        title: t('common.success'),
        description: t('categories.toasts.success_add') || "Catégorie créée avec succès",
      })
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: t('categories.toasts.error_add') || "Erreur lors de la création de la catégorie",
        variant: "destructive",
      })
      console.error("Error adding category:", err)
    }
  }, [addModal, toast, t])

  const handleUpdateCategory = useCallback(async (data: CategoryFormData) => {
    if (editModal.selectedItem) {
      try {
        const updatedCategoryData: Partial<Categorie> = {
          id: editModal.selectedItem.id,
          title: data.title,
          description: data.description || "",
        }
        await categorieService.updateCategorie(updatedCategoryData as Categorie)
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editModal.selectedItem!.id
              ? { ...cat, title: data.title, description: data.description || "" }
              : cat
          )
        )
        editModal.close()
        toast({
          title: t('common.success'),
          description: t('categories.toasts.success_update') || "Catégorie mise à jour avec succès",
        })
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: t('categories.toasts.error_update') || "Erreur lors de la mise à jour de la catégorie",
          variant: "destructive",
        })
        console.error("Error updating category:", err)
      }
    }
  }, [editModal, toast, t])

  const handleDeleteCategory = useCallback(async () => {
    if (deleteModal.selectedItem) {
      try {
        await categorieService.deleteCategorie(deleteModal.selectedItem.id)
        setCategories((prev) => prev.filter((cat) => cat.id !== deleteModal.selectedItem!.id))
        deleteModal.close()
        toast({
          title: t('common.success'),
          description: t('categories.toasts.success_delete') || "Catégorie supprimée avec succès",
        })
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: t('categories.toasts.error_delete') || "Erreur lors de la suppression de la catégorie",
          variant: "destructive",
        })
        console.error("Error deleting category:", err)
      }
    }
  }, [deleteModal, toast, t])

  const columns: ColumnDef<CategoryDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t('categories.list.header_category') || "Catégorie",
        cell: ({ row }) => {
          const category = row.original
          return (
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {category.title}
                </div>
                {category.description && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <FileText className="h-3.5 w-3.5" />
                    {category.description}
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "courses",
        header: t('categories.list.header_courses') || "Cours",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.courses}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('categories.list.header_actions') || "Actions",
        cell: ({ row }) => {
          const category = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('categories.list.action_view') || "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(category),
                },
                {
                  label: t('categories.list.action_edit') || "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(category),
                },
                {
                  label: t('categories.list.action_delete') || "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(category),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal, t]
  )

  if (loading) {
    return <PageLoader />
  }

  if (error && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('instructor.categories.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('instructor.categories.description')}</p>
        </div>
        <div className="text-center text-destructive p-4">{error}</div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={t('instructor.categories.title') || "Catégories"}
        action={{
          label: t('categories.list.add_button') || "Ajouter une catégorie",
          onClick: () => addModal.open(),
        }}
      />

      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('categories.list.search_placeholder') || "Rechercher une catégorie..."}
        />

        <DataTable
          data={filteredData}
          columns={columns}
          emptyMessage={t('categories.list.empty') || "Aucune catégorie trouvée"}
        />
      </div>

      {/* Add Category Modal */}
      <CategoryFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title={t('categories.modals.add_title') || "Ajouter une catégorie"}
        description={t('categories.modals.add_description') || "Créez une nouvelle catégorie pour organiser vos cours"}
        onSubmit={handleAddCategory}
        submitLabel={t('categories.modals.add_submit') || "Créer"}
      />

      {/* Edit Category Modal */}
      {editModal.selectedItem && (
        <CategoryFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('categories.modals.edit_title') || "Modifier la catégorie"}
          description={t('categories.modals.edit_description') || "Modifiez les informations de la catégorie"}
          defaultValues={{
            title: editModal.selectedItem.title,
            description: editModal.selectedItem.description,
          }}
          onSubmit={handleUpdateCategory}
          submitLabel={t('categories.modals.edit_submit') || "Enregistrer"}
        />
      )}

      {/* Delete Category Modal */}
      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteCategory}
        title={t('categories.modals.delete_title') || "Supprimer la catégorie"}
        description={
          t('categories.modals.delete_description', { name: deleteModal.selectedItem?.title }) ||
          `Êtes-vous sûr de vouloir supprimer la catégorie "${deleteModal.selectedItem?.title}" ?`
        }
        confirmText={t('categories.modals.delete_confirm') || "Supprimer"}
        variant="destructive"
      />

      {/* View Category Modal */}
      {viewModal.selectedItem && (
        <ViewCategoryModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          category={viewModal.selectedItem as any}
        />
      )}
    </>
  )
}
