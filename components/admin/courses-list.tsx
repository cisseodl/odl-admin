"use client"

import { useState, useMemo, useCallback } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "@/hooks/use-search";
import { FormationBuilderWizard } from "@/components/admin/courses/formation-builder-wizard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ViewCourseModal } from "./modals/view-course-modal";
import { CourseFormModal } from "@/components/shared/course-form-modal";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2, Power, Users, Clock, Star, BookOpen } from "lucide-react";
import type { CourseFormData } from "@/lib/validations/course";

import { Course as CourseModel, Categorie } from "@/models"; // Import Course from models/index.ts
import { courseService, categorieService, moduleService } from "@/services"; // Import courseService from services/index.ts
import { convertDurationToSeconds, convertSecondsToDurationString } from "@/lib/utils"; // Import duration conversion utilities
import { useEffect } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { Button } from "@/components/ui/button"; // Import Button for dropdown trigger
import { ListFilter } from "lucide-react"; // Import icon for filter button
import { ModulesPayload } from "@/services/module.service";

// Helper function to map CourseModel to CourseDisplay
type CourseDisplay = CourseModel;

export function CoursesList() {
  const addModal = useModal<CourseDisplay>();
  const editModal = useModal<CourseDisplay>();
  const deleteModal = useModal<CourseDisplay>();
  const viewModal = useModal<CourseDisplay>();
  const { toast } = useToast();

  const [courses, setCourses] = useState<CourseDisplay[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]); // State to store categories
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // State for selected category filter
  const [loading, setLoading] = useState(true);
  
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const categoriesResponse = await categorieService.getAllCategories();
      if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
        setCategories(categoriesResponse.data);
      } else {
        console.error("Unexpected categories response structure:", categoriesResponse);
        setCategories([]);
      }

      let coursesResponse;
      if (selectedCategory) {
        coursesResponse = await courseService.getCoursesByCategory(selectedCategory);
      } else {
        coursesResponse = await courseService.getAllCourses();
      }
      
      // getAllCourses peut retourner directement un tableau ou un objet avec data
      if (Array.isArray(coursesResponse)) {
        setCourses(coursesResponse);
      } else if (coursesResponse && Array.isArray(coursesResponse.data)) {
        setCourses(coursesResponse.data);
      } else if (coursesResponse && coursesResponse.data && Array.isArray(coursesResponse.data)) {
        setCourses(coursesResponse.data);
      } else {
        // Si c'est un objet mais pas un tableau, essayer d'extraire les données
        console.warn("Unexpected courses response structure:", coursesResponse);
        setCourses([]);
      }
    } catch (err: any) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);


    const { searchQuery, setSearchQuery, filteredData } = useSearch<CourseDisplay>({
      data: courses,
      searchKeys: ["title", "instructor.fullName", "categorie.title"],
    });

  const handleAddCourse = async (courseId?: number) => {
    try {
      // Le wizard gère déjà toute la création du cours, on rafraîchit juste la liste
      if (courseId) {
        addModal.close();
        toast({
          title: "Succès",
          description: "La formation complète a été créée avec succès.",
        });
        await fetchCourses(); // Refresh the list
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la création de la formation.",
        variant: "destructive",
      });
      console.error("Error adding course:", err);
    }
  };
  
  const handleUpdateCourse = async (data: CourseFormData & { imageFile?: File | null }) => {
    if (editModal.selectedItem) {
      try {
        const updatedCourseData: Partial<CourseModel> = {
          id: editModal.selectedItem.id,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          duration: convertDurationToSeconds(data.duration),
          level: data.level,
          language: data.language,
          bestseller: data.bestseller,
          objectives: data.objectives,
          features: data.features,
          price: data.price,
          status: data.status === "Publié" ? "PUBLISHED" : (data.status === "Brouillon" ? "DRAFT" : "IN_REVIEW"),
          activate: data.status === "Publié" ? true : false,
        };
        const updatedCourse = await courseService.updateCourse(editModal.selectedItem.id, updatedCourseData, data.imageFile);
        setCourses((prev) =>
          prev.map((course) =>
            course.id === editModal.selectedItem!.id ? { ...course, ...updatedCourse } : course
          )
        );
        editModal.close();
        toast({
          title: "Succès",
          description: "La formation a été mise à jour.",
        });
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la formation.",
          variant: "destructive",
        });
        console.error("Error updating course:", err);
      }
    }
  };

  const handleToggleActivate = async (course: CourseDisplay) => {
    try {
        const newActivateStatus = !course.activate;
        const newBackendStatus: CourseModel['status'] = newActivateStatus ? "PUBLISHED" : "DRAFT";

        const courseDataForUpdate: Partial<CourseModel> = {
            id: course.id,
            status: newBackendStatus,
            activate: newActivateStatus,
        };

        await courseService.updateCourse(courseDataForUpdate.id!, courseDataForUpdate);

        setCourses((prev) =>
            prev.map((c) =>
                c.id === course.id ? { ...c, status: newBackendStatus, activate: newActivateStatus } : c
            )
        );
        toast({
          title: "Succès",
          description: `La formation a été ${newActivateStatus ? 'activée' : 'stoppée'}.`,
        });
    } catch (err: any) {
        toast({
          title: "Erreur",
          description: "Impossible de changer le statut de la formation.",
          variant: "destructive",
        });
        console.error("Error updating course status:", err);
    }
  };

  const handleDeleteCourse = async () => {
    if (deleteModal.selectedItem) {
      try {
        await courseService.deleteCourse(deleteModal.selectedItem.id);
        setCourses((prev) => prev.filter((course) => course.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
        toast({
          title: "Succès",
          description: "La formation a été supprimée.",
        });
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la formation.",
          variant: "destructive",
        });
        console.error("Error deleting course:", err);
      }
    }
  };

  const columns: ColumnDef<CourseDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Formation",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "instructor.fullName", // Updated accessorKey
        header: "Formateur",
        cell: ({ row }) => row.original.instructor?.fullName || "N/A", // Display full name
      },
      {
        accessorKey: "categorie.title", // Updated accessorKey
        header: "Catégorie",
        cell: ({ row }) => row.original.categorie?.title || "N/A", // Display category title
      },
      {
        accessorKey: "students", // This still needs to be populated from backend
        header: "Étudiants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students || 0}
          </div>
        ),
      },
      {
        accessorKey: "duration",
        header: "Durée",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {row.original.duration ? convertSecondsToDurationString(row.original.duration) : "0h 0min"}
          </div>
        ),
      },
      {
        accessorKey: "rating", // This still needs to be populated from backend
        header: "Note",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating || 0}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status === "PUBLISHED" ? "Publié" : (row.original.status === "DRAFT" ? "Brouillon" : "En révision")} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const course = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(course),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(course),
                },
                {
                  label: course.activate ? 'Stopper' : 'Activer', // Use activate property for label
                  icon: <Power className="h-4 w-4" />,
                  onClick: () => handleToggleActivate(course),
                  variant: course.activate ? 'destructive' : 'default',
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(course),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal, handleToggleActivate]
  )

  console.log("CoursesList render - loading:", loading, "filteredData:", filteredData); // Debug log
  return (
    <>
      <PageHeader
        title="Formations"
        action={{
          label: "Ajouter une formation",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4 flex items-center gap-2"> {/* Added flex container */}
            <SearchBar
              placeholder="Rechercher une formation..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0"> {/* flex-shrink-0 to prevent button from shrinking */}
                  <ListFilter className="mr-2 h-4 w-4" />
                  {selectedCategory ? categories.find(cat => cat.id === selectedCategory)?.title : "Toutes les catégories"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrer par catégorie</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  Toutes les catégories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} onClick={() => setSelectedCategory(category.id)}>
                    {category.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {loading ? (
            <PageLoader />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>
      <FormationBuilderWizard
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        onComplete={handleAddCourse}
      />

      {editModal.selectedItem && (
        <CourseFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la formation"
          description="Modifiez les informations de la formation"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCourse}
          submitLabel="Enregistrer les modifications"
          categories={categories}
        />
      )}

      {viewModal.selectedItem && (
        <ViewCourseModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          course={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteCourse}
        title="Supprimer la formation"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.title} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
