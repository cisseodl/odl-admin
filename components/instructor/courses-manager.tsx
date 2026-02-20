"use client";

import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTable } from "@/components/ui/data-table";
import { ActionMenu } from "@/components/ui/action-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearch } from "@/hooks/use-search";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  BookOpen,
  FileText,
  Edit,
  X,
  Upload,
  Undo2,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader
import { courseService, categorieService } from "@/services"; // Import courseService and categorieService
import { useModal } from "@/hooks/use-modal";
import { CourseFormModal, CourseFormData } from "@/components/shared/course-form-modal";
import { ViewCourseSimpleModal } from "@/components/instructor/view-course-simple-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Categorie } from "@/models";
import { useToast } from "@/hooks/use-toast";

type Course = {
  id: number;
  title: string;
  modules: number;
  chapters: number;
  videos: number;
  students: number; // Ajouté
  status: "Publié" | "Non publié" | "En révision";
  rating: number; // Ajouté
  createdAt: string;
};

type CoursesManagerProps = {
  /** Incrémenter pour forcer un rafraîchissement de la liste (ex. après création depuis la page). */
  refreshTrigger?: number;
};

export function CoursesManager({ refreshTrigger }: CoursesManagerProps = {}) {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth(); // Utiliser useAuth
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true); // Nouveau state
  const [error, setError] = useState<string | null>(null); // Nouveau state
  const addCourseModal = useModal();
  const editCourseModal = useModal<Course>();
  const viewCourseModal = useModal<Course>();
  const deleteConfirmModal = useModal<Course>();

  const fetchCourses = async () => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Fetching courses for instructor ID:", user.id);
      const coursesData = await courseService.getCoursesByInstructorId(Number(user.id));
      console.log("Courses data received:", coursesData);
      // getCoursesByInstructorId retourne directement un tableau
      if (Array.isArray(coursesData)) {
        const mapped: Course[] = coursesData.map((c: any) => ({
          id: c.id,
          title: c.title || "Untitled",
          subtitle: c.subtitle,
          description: c.description,
          modules: Array.isArray(c.modules) ? c.modules.length : 0,
          chapters: Array.isArray(c.modules)
            ? c.modules.reduce(
                (acc: number, m: any) =>
                  acc + (Array.isArray(m.lessons) ? m.lessons.length : 0),
                0
              )
            : 0,
          videos: 0, // Placeholder
          students: c.enrolledCount || c.studentsCount || 0,
          status:
            c.status === "PUBLISHED" || c.status === "PUBLIE" || c.status === "Publié"
              ? "Publié"
              : c.status === "DRAFT" || c.status === "BROUILLON" || c.status === "Brouillon"
              ? "Non publié"
              : c.status === "IN_REVIEW" || c.status === "En révision"
              ? "En révision"
              : ("Non publié") as "Publié" | "Non publié" | "En révision",
          rating: c.rating || c.averageRating || 0,
          createdAt: c.createdAt
            ? new Date(c.createdAt).toLocaleDateString("fr-FR")
            : "",
          category: c.category, // String category title from backend mapper
          categorie: c.categorie, // Full categorie object if available
          formation: c.formation, // Formation object if available
          categoryId: c.categorie?.id || c.categoryId,
          level: c.level,
          language: c.language,
          imagePath: c.imageUrl || c.imagePath || c.image,
          activate: c.activate ?? true,
        }));
        console.log("Mapped courses:", mapped);
        setCourses(mapped);
      } else {
        setCourses([]);
      }
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      setError(err.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categorieService.getAllCategories();
      // Le service retourne maintenant toujours un tableau (vide en cas d'erreur)
      if (Array.isArray(response)) {
        setCategories(response);
      } else if (response && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        // Si response est null ou une structure inattendue, utiliser un tableau vide
        setCategories([]);
        if (response !== null && response !== undefined) {
          console.error("Unexpected categories response structure:", response);
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]); // S'assurer qu'on a toujours un tableau vide en cas d'erreur
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [user, authLoading]);

  // Rafraîchir la liste quand la page signale une création (ex. modal "Créer un cours" au niveau page)
  useEffect(() => {
    if (refreshTrigger != null && refreshTrigger > 0 && user && !authLoading) {
      fetchCourses();
    }
  }, [refreshTrigger]);

  const handleAddCourse = async (data: CourseFormData) => {
    console.log(">>>> handleAddCourse called!"); // ADD THIS LOG
    try {
      const { categoryId, ...courseData } = data;
      console.log("[InstructorCoursesManager] handleAddCourse - Request data:", { categoryId, courseData }); // ADD LOG
      const response = await courseService.createCourse(categoryId, courseData);
      console.log("[InstructorCoursesManager] handleAddCourse - Response:", response); // ADD LOG
      addCourseModal.close();
      
      toast({
        title: "Succès",
        description: "Le cours a été créé avec succès.",
      });
      
      // Rafraîchir la liste des cours
      await fetchCourses();
    } catch (err: any) {
      console.error("[InstructorCoursesManager] handleAddCourse - Error creating course:", err); // ADD LOG
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le cours.",
        variant: "destructive",
      });
      setError(err.message || "Failed to create course.");
    }
  };

  const handleUpdateCourse = async (data: CourseFormData) => {
    if (!editCourseModal.selectedItem || !user) return;
    try {
      const { categoryId, ...courseData } = data;
      const payloadWithId = {
        ...courseData,
        id: editCourseModal.selectedItem.id,
        categoryId: Number(categoryId),
        instructorId: Number(user.id),
      };
      console.log("[InstructorCoursesManager] handleUpdateCourse - Request data:", { id: editCourseModal.selectedItem.id, categoryId, payloadWithId });
      const response = await courseService.updateCourse(editCourseModal.selectedItem.id, payloadWithId, undefined);
      console.log("[InstructorCoursesManager] handleUpdateCourse - Response:", response); // ADD LOG
      editCourseModal.close();
      
      toast({
        title: "Succès",
        description: "Le cours a été mis à jour avec succès.",
      });
      
      fetchCourses();
    } catch (err: any) {
      console.error("[InstructorCoursesManager] handleUpdateCourse - Error updating course:", err); // ADD LOG
      toast({
        title: "Erreur",
        description: err.message || "Impossible de mettre à jour le cours.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      console.log("[InstructorCoursesManager] handleDeleteCourse - Deleting course with ID:", courseId); // ADD LOG
      const response = await courseService.deleteCourse(courseId);
      console.log("[InstructorCoursesManager] handleDeleteCourse - Response:", response); // ADD LOG
      deleteConfirmModal.close();
      
      toast({
        title: "Succès",
        description: "Le cours a été supprimé avec succès.",
      });
      
      fetchCourses();
    } catch (err: any) {
      console.error("[InstructorCoursesManager] handleDeleteCourse - Error deleting course:", err); // ADD LOG
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer le cours.",
        variant: "destructive",
      });
    }
  };

  const handlePublishCourse = async (course: Course) => {
    console.log("[CoursesManager] Publier cliqué – courseId:", course.id, "titre:", course.title);
    try {
      const result = await courseService.validateCourse(course.id, "APPROVE");
      console.log("[CoursesManager] Publication OK – réponse:", result);
      toast({
        title: "Succès",
        description: "Le cours a été publié.",
      });
      await fetchCourses();
    } catch (err: any) {
      const message = err?.message || "Impossible de publier le cours.";
      console.error("[CoursesManager] Erreur publication cours:", message, err);
      toast({
        title: "Erreur publication",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleWithdrawCourse = async (course: Course) => {
    try {
      await courseService.validateCourse(course.id, "WITHDRAW");
      toast({
        title: "Succès",
        description: "Le cours a été retiré (non publié).",
      });
      await fetchCourses();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de retirer le cours.",
        variant: "destructive",
      });
    }
  };

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Course>({
    data: courses,
    searchKeys: ["title"],
  });

  const columns: ColumnDef<Course>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Cours",
        cell: ({ row }) => {
          const course = row.original;
          // Afficher la hiérarchie : Catégorie → Cours
          const categoryTitle = course.categorie?.title || course.category || null;
          const formationTitle = course.formation?.title || null;
          const courseTitle = course.title || "Sans titre";
          
          if (!courseTitle) {
            return null;
          }
          
          return (
            <div className="font-medium flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{courseTitle}</span>
              </div>
              {(formationTitle || categoryTitle) && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 ml-6">
                  {categoryTitle && <span>{categoryTitle}</span>}
                  {formationTitle && categoryTitle && <span className="mx-1">→</span>}
                  {formationTitle && <span>{formationTitle}</span>}
                  {(formationTitle || categoryTitle) && <span className="mx-1">→</span>}
                  <span className="font-medium text-primary">{courseTitle}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "modules",
        header: "Modules",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.modules}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => {
          const status = row.original.status || "Non publié";
          return <StatusBadge status={status} />;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const course = row.original;
          const isPublished = course.status === "Publié";
          const actions: Array<{ label: string; icon: React.ReactNode; onClick: () => void; variant?: "default" | "destructive" }> = [
            {
              label: "Voir",
              icon: <Eye className="h-4 w-4" />,
              onClick: () => viewCourseModal.open(course),
            },
            {
              label: "Modifier",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => editCourseModal.open(course),
            },
            ...(isPublished
              ? [{ label: "Rétirer", icon: <Undo2 className="h-4 w-4" />, onClick: () => handleWithdrawCourse(course) }]
              : [{ label: "Publier", icon: <Upload className="h-4 w-4" />, onClick: () => handlePublishCourse(course) }]),
            {
              label: "Supprimer",
              icon: <X className="h-4 w-4" />,
              onClick: () => deleteConfirmModal.open(course),
              variant: "destructive" as const,
            },
          ];
          return <ActionMenu actions={actions} />;
        },
      },
    ],
    [t, viewCourseModal, editCourseModal, deleteConfirmModal]
  );

  return (
    <>

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  Tous les cours ({courses.length})
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  Les cours publiés ({courses.filter((c) => c.status === "Publié").length})
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  Les cours non publiés ({courses.filter((c) => c.status === "Non publié").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="mb-4">
                  <SearchBar
                    placeholder={t('courses.search_placeholder')}
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <DataTable
                  columns={columns}
                  data={filteredData}
                  searchValue={searchQuery}
                />
              </TabsContent>

              <TabsContent value="published" className="space-y-4">
                <div className="mb-4">
                  <SearchBar
                    placeholder={t('courses.search_placeholder')}
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <DataTable
                  columns={columns}
                  data={filteredData.filter((c) => c.status === "Publié")}
                  searchValue={searchQuery}
                />
              </TabsContent>

              <TabsContent value="draft" className="space-y-4">
                <div className="mb-4">
                  <SearchBar
                    placeholder={t('courses.search_placeholder')}
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <DataTable
                  columns={columns}
                  data={filteredData.filter((c) => c.status === "Non publié")}
                  searchValue={searchQuery}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      <CourseFormModal
        open={addCourseModal.isOpen}
        onOpenChange={addCourseModal.close}
        title={t('courses.actions.create')}
        description=""
        onSubmit={handleAddCourse}
        submitLabel={t('courses.actions.create')}
        categories={categories}
      />
      
      {editCourseModal.selectedItem && (
        <CourseFormModal
          open={editCourseModal.isOpen}
          onOpenChange={(open) => !open && editCourseModal.close()}
          title="Modifier le cours"
          description="Mettez à jour les informations du cours"
          defaultValues={editCourseModal.selectedItem}
          onSubmit={handleUpdateCourse}
          submitLabel="Enregistrer"
          categories={categories}
        />
      )}

      {viewCourseModal.selectedItem && (
        <ViewCourseSimpleModal
          open={viewCourseModal.isOpen}
          onOpenChange={(open) => !open && viewCourseModal.close()}
          course={viewCourseModal.selectedItem}
        />
      )}

      {deleteConfirmModal.selectedItem && (
        <ConfirmDialog
          open={deleteConfirmModal.isOpen}
          onOpenChange={(open) => !open && deleteConfirmModal.close()}
          onConfirm={() => handleDeleteCourse(deleteConfirmModal.selectedItem!.id)}
          title="Supprimer le cours"
          description={`Êtes-vous sûr de vouloir supprimer le cours "${deleteConfirmModal.selectedItem?.title}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          variant="destructive"
        />
      )}
    </>
  );
}
