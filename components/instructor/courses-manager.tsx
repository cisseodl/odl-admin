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
  Users,
  Clock,
  Star,
  FileText,
  Video,
  Play,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader
import { courseService, categorieService } from "@/services"; // Import courseService and categorieService
import { useModal } from "@/hooks/use-modal";
import { CourseFormModal, CourseFormData } from "@/components/shared/course-form-modal";
import { ViewCourseModal } from "@/components/admin/modals/view-course-modal";
import { Categorie } from "@/models";
import { useToast } from "@/hooks/use-toast";

type Course = {
  id: number;
  title: string;
  modules: number;
  chapters: number;
  videos: number;
  students: number; // Ajouté
  status: "Publié" | "Brouillon" | "En révision";
  rating: number; // Ajouté
  createdAt: string;
};

export function CoursesManager() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth(); // Utiliser useAuth
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true); // Nouveau state
  const [error, setError] = useState<string | null>(null); // Nouveau state
  const addCourseModal = useModal();
  const viewCourseModal = useModal<Course>();

  const fetchCourses = async () => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const coursesData = await courseService.getCoursesByInstructorId(Number(user.id));
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
              ? "Brouillon"
              : c.status === "IN_REVIEW" || c.status === "En révision"
              ? "En révision"
              : (c.status || "Brouillon") as "Publié" | "Brouillon" | "En révision",
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

  const handleAddCourse = async (data: CourseFormData) => {
    try {
      const { categoryId, ...courseData } = data;
      const response = await courseService.createCourse(categoryId, courseData);
      addCourseModal.close();
      
      toast({
        title: "Succès",
        description: response?.message || "La formation a été créée avec succès.",
      });
      
      fetchCourses();
    } catch (err: any) {
      console.error("Error creating course:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer la formation.",
        variant: "destructive",
      });
      setError(err.message || "Failed to create course.");
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
        header: t('courses.list.header_course'),
        cell: ({ row }) => {
          const course = row.original;
          // Afficher la hiérarchie : Catégorie → Formation → Cours
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
        header: t('courses.modules'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.modules}
          </div>
        ),
      },
      {
        accessorKey: "chapters",
        header: t('courses.chapters'),
      },
      {
        accessorKey: "videos",
        header: t('courses.videos'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4 text-muted-foreground" />
            {row.original.videos}
          </div>
        ),
      },
      {
        accessorKey: "students",
        header: t('courses.list.header_students'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students}
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: t('courses.list.header_rating'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t('courses.list.header_status'),
        cell: ({ row }) => {
          const status = row.original.status || "Brouillon";
          return <StatusBadge status={status} />;
        },
      },
      {
        id: "actions",
        header: t('common.actions'),
        cell: ({ row }) => {
          const course = row.original;
          // Convertir le Course local en Course du modèle pour la modal
          const courseForModal: any = {
            id: course.id,
            title: course.title,
            subtitle: "",
            description: "",
            imagePath: "",
            duration: 0,
            level: "",
            language: "",
            bestseller: false,
            objectives: [],
            features: [],
            modules: [],
            status: course.status === "Publié" ? "PUBLISHED" : course.status === "Brouillon" ? "DRAFT" : "IN_REVIEW",
            price: 0,
            categorie: null,
            instructor: null,
            students: course.students,
            rating: course.rating,
          };
          return (
            <ActionMenu
              actions={[
                {
                  label: t('common.view'),
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewCourseModal.open(courseForModal),
                },
              ]}
            />
          );
        },
      },
    ],
    [t, viewCourseModal]
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
                  {t('courses.tabs.all')} ({courses.length})
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  {t('courses.tabs.published')} ({courses.filter((c) => c.status === "Publié").length})
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  {t('courses.tabs.draft')} ({courses.filter((c) => c.status === "Brouillon").length})
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
                  data={filteredData.filter((c) => c.status === "Brouillon")}
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
        description={t('courses.create_description')}
        onSubmit={handleAddCourse}
        submitLabel={t('courses.actions.create')}
        categories={categories}
      />
      
      {viewCourseModal.selectedItem && (
        <ViewCourseModal
          open={viewCourseModal.isOpen}
          onOpenChange={(open) => !open && viewCourseModal.close()}
          course={viewCourseModal.selectedItem}
        />
      )}
    </>
  );
}
