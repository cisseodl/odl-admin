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
import { CourseBuilderWizard } from "@/components/admin/courses/course-builder-wizard"
import type { CourseBuilderFormData } from "@/lib/validations/course-builder"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewCourseModal } from "./modals/view-course-modal"
import { CourseFormModal } from "@/components/shared/course-form-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Power, Users, Clock, Star, BookOpen } from "lucide-react"
import type { CourseFormData } from "@/lib/validations/course"

import { Course as CourseModel, Categorie } from "@/models"; // Import Course from models/index.ts
import { courseService, categorieService } from "@/services"; // Import courseService from services/index.ts
import { useEffect } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { Button } from "@/components/ui/button"; // Import Button for dropdown trigger
import { ListFilter } from "lucide-react"; // Import icon for filter button

// Helper function to map CourseModel to CourseDisplay
const mapCourseModelToCourseDisplay = (courseModel: CourseModel): CourseDisplay => {
  // Placeholder values for fields not directly available in CourseModel
  const instructor = "N/A"; // No instructor in CourseModel
  const students = 0; // No students count in CourseModel
  const rating = 0; // No rating in CourseModel

  const status: CourseDisplay['status'] = courseModel.activate ? "Publié" : "Brouillon"; // Simplified status mapping
  const duration = courseModel.duration ? `${courseModel.duration}h 0min` : "0h 0min"; // Assuming duration is in hours

  return {
    id: courseModel.id || 0,
    title: courseModel.title || "",
    instructor: instructor,
    category: courseModel.categorie?.title || "Unknown", // Get category title from nested object
    students: students,
    status: status,
    duration: duration,
    rating: rating,
    thumbnail: courseModel.imagePath || undefined,
  };
};

export function CoursesList() {
  const addModal = useModal<CourseDisplay>()
  const editModal = useModal<CourseDisplay>()
  const deleteModal = useModal<CourseDisplay>()
  const viewModal = useModal<CourseDisplay>()

  const [courses, setCourses] = useState<CourseDisplay[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]); // State to store categories
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // State for selected category filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories
        const fetchedCategories = await categorieService.getAllCategories();
        setCategories(fetchedCategories);

        // Fetch courses based on selected category
        let coursesResponse: CourseModel[];
        if (selectedCategory) {
          coursesResponse = await courseService.getCoursesByCategory(selectedCategory);
        } else {
          coursesResponse = await courseService.getAllCourses();
        }
        
        console.log("API response for courses:", coursesResponse); // Debug log
        const mappedCourses = coursesResponse.map(mapCourseModelToCourseDisplay);
        console.log("Mapped courses:", mappedCourses); // Debug log
        setCourses(mappedCourses);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]); // Refetch when selectedCategory changes


    const { searchQuery, setSearchQuery, filteredData } = useSearch<CourseDisplay>({


      data: courses,


      searchKeys: ["title", "instructor", "category"],


    }); // Added semicolon here


  


    console.log("CoursesList render - loading:", loading, "error:", error, "filteredData:", filteredData); // Debug log moved to here


  


    const handleAddCourse = async (data: CourseFormData | CourseBuilderFormData) => {


      setError(null);


      try {


        let newCourseData: any;


        let categoryId: number | undefined;


        let chaptersToCreate: any[] = [];

      // Extract category ID. This requires fetching categories first or assuming an ID from input.
      // For now, let's assume category is directly available as a string and we need to map it to an ID.
      // This is a simplification; a real app would have a category selector with IDs.
      // For this example, let's try to find the category by name from the fetched categories.
      const selectedCategoryFromForm = categories.find(cat => cat.title === data.category);
      categoryId = selectedCategoryFromForm?.id || 1; // Default to 1 if not found

      if ("structure" in data) {
        // CourseBuilderFormData - this is where chapter info comes from
        const builderData = data as CourseBuilderFormData;
        newCourseData = {
          title: builderData.title,
          description: builderData.description,
          duration: builderData.structure?.totalDuration ? parseInt(builderData.structure.totalDuration.split('h')[0]) : 0, // Assuming duration is "Xh Ymin"
          courseType: "REGISTER", // Defaulting as per test.md examples
          price: 0.00, // Default price
        };
        
        // Collect chapters from builderData
        builderData.structure.modules.forEach(module => {
          module.chapters.forEach(chapter => {
            chaptersToCreate.push({
              title: chapter.title,
              description: chapter.description,
              // Other chapter fields if needed, like pdfPath, chapterLink
            });
          });
        });

      } else {
        // CourseFormData - simpler form, no chapter info here
        const formData = data as CourseFormData;
        newCourseData = {
          title: formData.title,
          description: formData.description,
          duration: parseInt(formData.duration.split('h')[0]),
          courseType: "REGISTER",
          price: 0.00, // Placeholder
        };
      }

      // 1. Create the course
      const createdCourse = await courseService.createCourse(categoryId, newCourseData);
      
      // 2. Create chapters for the new course if any
      if (createdCourse.id && chaptersToCreate.length > 0) {
        // The chapterService.createChapter expects a specific structure:
        // {"courseId": "...", "courseType": "REGISTER", "chapters": [{"title": "...", "description": "..."}]}
        const chapterApiData = {
          courseId: createdCourse.id,
          courseType: "REGISTER", // Or get from newCourseData
          chapters: chaptersToCreate,
        };
        await chapterService.createChapter(chapterApiData);
      }

      setCourses((prev) => [...prev, mapCourseModelToCourseDisplay(createdCourse)]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add course.");
      console.error("Error adding course:", err);
    }
  };
  const handleUpdateCourse = async (data: CourseFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedCourseData: Partial<CourseModel> = {
          id: editModal.selectedItem.id,
          title: data.title,
          description: data.description,
          duration: parseInt(data.duration.split('h')[0]),
          // Other fields from editModal.selectedItem might need to be preserved
          activate: editModal.selectedItem.status === "Publié" ? true : false,
        };
        // Need to handle imageFile if it's part of the form
        await courseService.updateCourse(updatedCourseData);
        setCourses((prev) =>
          prev.map((course) =>
            course.id === editModal.selectedItem!.id ? { ...course, ...mapCourseModelToCourseDisplay(updatedCourseData as CourseModel) } : course
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update course.");
        console.error("Error updating course:", err);
      }
    }
  };

  const handleToggleActivate = async (course: CourseDisplay) => {
    setError(null);
    try {
        const newStatus = course.status !== "Publié";

        // Construct a more complete object for the update to satisfy backend validation
        const courseDataForUpdate = {
            id: course.id,
            title: course.title,
            description: course.description, // Assuming description is available on CourseDisplay
            duration: parseInt(course.duration.split('h')[0]) || 0,
            activate: newStatus,
            // Include other fields from 'course' if necessary to build a valid CourseModel object
        };

        await courseService.updateCourse(courseDataForUpdate);

        setCourses((prev) =>
            prev.map((c) =>
                c.id === course.id ? { ...c, status: newStatus ? "Publié" : "Brouillon" } : c
            )
        );
    } catch (err: any) {
        setError(err.message || "Failed to update course status.");
        console.error("Error updating course status:", err);
    }
  };

  const handleDeleteCourse = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await courseService.deleteCourse(deleteModal.selectedItem.id);
        setCourses((prev) => prev.filter((course) => course.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete course.");
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
        accessorKey: "instructor",
        header: "Instructeur",
      },
      {
        accessorKey: "category",
        header: "Catégorie",
      },
      {
        accessorKey: "students",
        header: "Étudiants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students}
          </div>
        ),
      },
      {
        accessorKey: "duration",
        header: "Durée",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {row.original.duration}
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
                  label: course.status === 'Publié' ? 'Stopper' : 'Activer',
                  icon: <Power className="h-4 w-4" />,
                  onClick: () => handleToggleActivate(course),
                  variant: course.status === 'Publié' ? 'destructive' : 'default',
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

  console.log("CoursesList render - loading:", loading, "error:", error, "filteredData:", filteredData); // Debug log
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
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>
      <CourseBuilderWizard
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
