"use client"

import { useState, useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useToast } from "@/hooks/use-toast"
import { useSearch } from "@/hooks/use-search"
import { CategoryFormModal } from "@/components/shared/category-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewCategoryModal } from "./modals/view-category-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Tag, BookOpen, FileText } from "lucide-react"
import type { CategoryFormData } from "@/lib/validations/category"

import { Categorie } from "@/models"; // Import Categorie from models/index.ts
import { categorieService, courseService } from "@/services"; // Import categorieService and courseService from services/index.ts
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
    courses: 0, // Will be set when fetching categories with course count
  };
};


export function CategoriesList() {
  const { t } = useLanguage()
  const addModal = useModal<CategoryDisplay>()
  const editModal = useModal<CategoryDisplay>()
  const deleteModal = useModal<CategoryDisplay>()
  const viewModal = useModal<CategoryDisplay>()
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupérer les catégories et les cours en parallèle
        const [categoriesResponse, coursesResponse] = await Promise.all([
          categorieService.getAllCategories(),
          courseService.getAllCourses({})
        ]);
        
        const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || []);
        const coursesData = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse?.data || []);
        
        // Compter le nombre de cours par catégorie
        const courseCountByCategory = new Map<number, number>();
        coursesData.forEach((course: any) => {
          const categoryId = course.categorie?.id || course.categoryId;
          if (categoryId) {
            courseCountByCategory.set(categoryId, (courseCountByCategory.get(categoryId) || 0) + 1);
          }
        });
        
        if (categoriesData.length > 0) {
          setCategories(categoriesData.map((cat: Categorie) => ({
            ...mapCategorieToCategoryDisplay(cat),
            courses: courseCountByCategory.get(cat.id || 0) || 0
          })));
        } else {
          console.error("Unexpected response structure:", categoriesResponse);
          setCategories([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.");
        toast({
          title: t('common.error'),
          description: t('categories.toasts.error_fetch'),
          variant: "destructive",
        });
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [toast, t]); // Added t to dependencies


  const { searchQuery, setSearchQuery, filteredData } = useSearch<CategoryDisplay>({
    data: categories,
    searchKeys: ["title", "description"],
  })

  const handleAddCategory = async (data: CategoryFormData) => {
    try {
      const newCategoryData = {
        title: data.title,
        description: data.description,
      };
      const createdCategory = await categorieService.createCategorie(newCategoryData);
      setCategories((prev) => [...prev, mapCategorieToCategoryDisplay(createdCategory)]);
      addModal.close();
        toast({
          title: t('common.success'),
          description: t('categories.toasts.success_add'),
        });
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: t('categories.toasts.error_add'),
          variant: "destructive",
        });
      console.error("Error adding category:", err);
    }
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
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
        toast({
          title: t('common.success'),
          description: t('categories.toasts.success_update'),
        });
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: t('categories.toasts.error_update'),
          variant: "destructive",
        });
        console.error("Error updating category:", err);
      }
    }
  };

  const handleDeleteCategory = async () => { // Removed id parameter as deleteModal.selectedItem is used
    if (deleteModal.selectedItem) {
      try {
        await categorieService.deleteCategorie(deleteModal.selectedItem.id);
        setCategories((prev) => prev.filter((cat) => cat.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
        toast({
          title: t('common.success'),
          description: t('categories.toasts.success_delete'),
        });
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: t('categories.toasts.error_delete'),
          variant: "destructive",
        });
        console.error("Error deleting category:", err);
      }
    }
  };

  const columns: ColumnDef<CategoryDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t('categories.list.header_category'),
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
        header: t('categories.list.header_courses'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.courses}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('categories.list.header_actions'),
        cell: ({ row }) => {
          const category = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('categories.list.action_view'),
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(category),
                },
                {
                  label: t('categories.list.action_edit'),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(category),
                },
                {
                  label: t('categories.list.action_delete'),
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

  return (
    <>
      <PageHeader
        title={t('categories.list.title')}
        action={{
          label: t('categories.list.add_button'),
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('categories.list.search_placeholder')}
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
        title={t('categories.modals.add_title')}
        description={t('categories.modals.add_description')}
        onSubmit={handleAddCategory}
        submitLabel={t('categories.modals.add_submit')}
      />

      {editModal.selectedItem && (
        <CategoryFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('categories.modals.edit_title')}
          description={t('categories.modals.edit_description')}
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCategory}
          submitLabel={t('categories.modals.edit_submit')}
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
        title={t('categories.modals.delete_title')}
        description={t('categories.modals.delete_description').replace('{{name}}', deleteModal.selectedItem?.title || '')}
        confirmText={t('categories.modals.delete_confirm')}
        variant="destructive"
      />
    </>
  )
}
