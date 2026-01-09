"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Categorie } from "@/models";

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
  const { user, isLoading: authLoading } = useAuth(); // Utiliser useAuth
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true); // Nouveau state
  const [error, setError] = useState<string | null>(null); // Nouveau state
  const addCourseModal = useModal();

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
          modules: Array.isArray(c.modules) ? c.modules.length : 0,
          chapters: Array.isArray(c.modules)
            ? c.modules.reduce(
                (acc: number, m: any) =>
                  acc + (Array.isArray(m.lessons) ? m.lessons.length : 0),
                0
              )
            : 0,
          videos: 0, // Placeholder
          students: c.studentsCount || 0,
          status:
            c.status === "PUBLISHED" || c.status === "PUBLIE" || c.status === "Publié"
              ? "Publié"
              : c.status === "DRAFT" || c.status === "BROUILLON" || c.status === "Brouillon"
              ? "Brouillon"
              : c.status === "IN_REVIEW" || c.status === "En révision"
              ? "En révision"
              : "Brouillon",
          rating: c.averageRating || 0,
          createdAt: c.createdAt
            ? new Date(c.createdAt).toLocaleDateString("fr-FR")
            : "",
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
      if (response && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error("Unexpected categories response structure:", response);
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [user, authLoading]);

  const handleAddCourse = async (data: CourseFormData) => {
    try {
      const { categoryId, ...courseData } = data;
      await courseService.createCourse(categoryId, courseData);
      addCourseModal.close();
      fetchCourses();
    } catch (err: any) {
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
        header: "Formation",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
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
        accessorKey: "chapters",
        header: "Chapitres",
      },
      {
        accessorKey: "videos",
        header: "Vidéos",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4 text-muted-foreground" />
            {row.original.videos}
          </div>
        ),
      },
      {
        accessorKey: "students",
        header: "Apprenants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students}
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: "Note",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => console.log("View", course),
                },
              ]}
            />
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Mes Formations"
        description="Gérez vos formations, modules, chapitres et vidéos"
        action={{
          label: "Créer une formation",
          onClick: addCourseModal.open,
        }}
      />

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  Toutes ({courses.length})
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  Publiées ({courses.filter((c) => c.status === "Publié").length})
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  Brouillons (
                  {courses.filter((c) => c.status === "Brouillon").length})
                </TabsTrigger>
                <TabsTrigger
                  value="review"
                  className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                >
                  En révision (
                  {courses.filter((c) => c.status === "En révision").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="mb-4">
                  <SearchBar
                    placeholder="Rechercher une formation..."
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
                    placeholder="Rechercher une formation..."
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
                    placeholder="Rechercher une formation..."
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

              <TabsContent value="review" className="space-y-4">
                <div className="mb-4">
                  <SearchBar
                    placeholder="Rechercher une formation..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <DataTable
                  columns={columns}
                  data={filteredData.filter((c) => c.status === "En révision")}
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
        title="Créer une formation"
        description="Remplissez les informations de base de votre nouvelle formation."
        onSubmit={handleAddCourse}
        submitLabel="Créer la formation"
        categories={categories}
      />
    </>
  );
}
