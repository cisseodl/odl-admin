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
import { CategoryFormModal } from "@/components/shared/category-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewCategoryModal } from "./modals/view-category-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Tag, BookOpen, FileText } from "lucide-react"
import type { CategoryFormData } from "@/lib/validations/category"

import { Categorie } from "@/models"; // Import Categorie from models/index.ts
import { categorieService } from "@/services"; // Import categorieService from services/index.ts
import { useEffect } from "react";
import { PageLoader } from "@/components/ui/page-loader";


type CategoryDisplay = {
  id: number
  title: string
  description: string
  courses: number // This needs to be derived or added by backend
}

// Helper function to map Categorie to CategoryDisplay
const mapCategorieToCategoryDisplay = (categorie: Categorie): CategoryDisplay => {
  return {
    id: categorie.id || 0,
    title: categorie.title || "",
    description: categorie.description || "",
    courses: 0, // Placeholder
  };
};


export function CategoriesList() {
  const addModal = useModal<CategoryDisplay>()
  const editModal = useModal<CategoryDisplay>()
  const deleteModal = useModal<CategoryDisplay>()
  const viewModal = useModal<CategoryDisplay>()

  const [categories, setCategories] = useState<CategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await categorieService.getAllCategories();
        setCategories(response.map(mapCategorieToCategoryDisplay));
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount


  const { searchQuery, setSearchQuery, filteredData } = useSearch<CategoryDisplay>({
    data: categories,
    searchKeys: ["title", "description"],
  })

  const handleAddCategory = async (data: CategoryFormData) => {
    setError(null);
    try {
      const newCategoryData = {
        title: data.title,
        description: data.description,
      };
      const createdCategory = await categorieService.createCategorie(newCategoryData);
      setCategories((prev) => [...prev, mapCategorieToCategoryDisplay(createdCategory)]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add category.");
      console.error("Error adding category:", err);
    }
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedCategoryData: Partial<Categorie> = {
          id: editModal.selectedItem.id, // ID is part of the Categorie object for update
          title: data.title,
          description: data.description,
        };
        await categorieService.updateCategorie(updatedCategoryData as Categorie); // Cast to Categorie
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editModal.selectedItem!.id ? { ...cat, title: data.title, description: data.description } : cat
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update category.");
        console.error("Error updating category:", err);
      }
    }
  };

  const handleDeleteCategory = async () => { // Removed id parameter as deleteModal.selectedItem is used
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await categorieService.deleteCategorie(deleteModal.selectedItem.id);
        setCategories((prev) => prev.filter((cat) => cat.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        // More specific error message for 404 or other API errors during deletion
        const errorMessage = err.message || "Failed to delete category.";
        if (errorMessage.includes("404")) {
          setError(`La catégorie ${deleteModal.selectedItem?.title || "sélectionnée"} n'a pas été trouvée ou a déjà été supprimée.`);
        } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
          setError("Vous n'êtes pas autorisé à supprimer cette catégorie.");
        } else {
          setError(`Erreur lors de la suppression de la catégorie : ${errorMessage}`);
        }
        console.error("Error deleting category:", err);
      }
    }
  };

  const columns: ColumnDef<CategoryDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Catégorie",
        cell: ({ row }) => {
          const category = row.original
          return (
            <div className="flex items-center gap-3">
              {/* Removed color dot, as 'color' is no longer in CategoryDisplay */}
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {category.title}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <FileText className="h-3.5 w-3.5" />
                  {category.description}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "courses",
        header: "Formations",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.courses}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const category = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(category),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(category),
                },
                {
                  label: "Supprimer",
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
    [viewModal, editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title="Catégories"
        action={{
          label: "Ajouter une catégorie",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <CategoryFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter une catégorie"
        description="Créez une nouvelle catégorie pour organiser les formations"
        onSubmit={handleAddCategory}
        submitLabel="Créer la catégorie"
      />

      {editModal.selectedItem && (
        <CategoryFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la catégorie"
          description="Modifiez les informations de la catégorie"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCategory}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewCategoryModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          category={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteCategory}
        title="Supprimer la catégorie"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
