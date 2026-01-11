"use client"

import { useState, useMemo, useCallback } from "react"
import { useLanguage } from "@/contexts/language-context"
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
import { courseService, categorieService, moduleService, instructorService } from "@/services"; // Import courseService from services/index.ts
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
  const { t } = useLanguage()
  const addModal = useModal<CourseDisplay>();
  const editModal = useModal<CourseDisplay>();
  const deleteModal = useModal<CourseDisplay>();
  const viewModal = useModal<CourseDisplay>();
  const { toast } = useToast();

  const [courses, setCourses] = useState<CourseDisplay[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]); // State to store categories
  const [instructors, setInstructors] = useState<any[]>([]); // State to store instructors
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // State for selected category filter
  const [loading, setLoading] = useState(true);
  
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Charger les catégories et instructeurs en parallèle
      const [categoriesResponse, instructorsResponse] = await Promise.all([
        categorieService.getAllCategories(),
        instructorService.getAllInstructors()
      ]);

      let categoriesData: Categorie[] = [];
      if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
        categoriesData = categoriesResponse.data;
        setCategories(categoriesData);
      } else if (Array.isArray(categoriesResponse)) {
        categoriesData = categoriesResponse;
        setCategories(categoriesData);
      } else {
        console.error("Unexpected categories response structure:", categoriesResponse);
        setCategories([]);
      }

      // Traiter la réponse des instructeurs
      let instructorsData: any[] = [];
      if (instructorsResponse) {
        if (Array.isArray(instructorsResponse.data)) {
          instructorsData = instructorsResponse.data;
        } else if (Array.isArray(instructorsResponse)) {
          instructorsData = instructorsResponse;
        }
      }
      setInstructors(instructorsData);

      let coursesResponse;
      if (selectedCategory) {
        coursesResponse = await courseService.getCoursesByCategory(selectedCategory);
      } else {
        coursesResponse = await courseService.getAllCourses();
      }
      
      // getAllCourses peut retourner directement un tableau ou un objet avec data
      let coursesData: any[] = [];
      if (Array.isArray(coursesResponse)) {
        coursesData = coursesResponse;
      } else if (coursesResponse && Array.isArray(coursesResponse.data)) {
        coursesData = coursesResponse.data;
      } else if (coursesResponse && coursesResponse.data && Array.isArray(coursesResponse.data)) {
        coursesData = coursesResponse.data;
      } else {
        console.warn("Unexpected courses response structure:", coursesResponse);
        coursesData = [];
      }

      // Debug: Log pour voir la structure des données
      if (coursesData.length > 0) {
        console.log("Sample course data (full):", JSON.stringify(coursesData[0], null, 2));
        console.log("Available categories:", categoriesData.length);
        console.log("Available instructors:", instructorsData.length);
        if (instructorsData.length > 0) {
          console.log("Sample instructor:", instructorsData[0]);
        }
      }

      // Enrichir les cours avec les informations de catégorie et d'instructeur
      let enrichedCourses = coursesData.map((course: any) => {
        const enriched: CourseDisplay = { ...course };

        // Le backend retourne category comme string (titre) et instructor comme InstructorDto
        // Enrichir la catégorie : le backend retourne 'category' comme string (titre)
        if (course.category && typeof course.category === 'string') {
          // Chercher la catégorie par titre dans notre liste
          const category = categoriesData.find((cat: Categorie) => cat.title === course.category);
          if (category) {
            enriched.categorie = category;
          }
        } else if (!enriched.categorie || !enriched.categorie.title) {
          // Fallback : essayer de trouver par ID
          const categoryId = course.categorieId || course.categoryId || course.categorie?.id || 
                            (typeof course.categorie === 'number' ? course.categorie : null);
          if (categoryId) {
            const category = categoriesData.find((cat: Categorie) => cat.id === Number(categoryId));
            if (category) {
              enriched.categorie = category;
            }
          }
        }

        // Enrichir l'instructeur : le backend peut retourner 'instructor' comme InstructorDto avec 'name'
        // ou null si le profil instructeur n'existe pas
        let instructorFound = false;

        // 1. Vérifier si instructor est présent et a un nom
        if (course.instructor) {
          if (course.instructor.name) {
            // InstructorDto du backend avec 'name'
            enriched.instructor = {
              id: course.instructor.id,
              fullName: course.instructor.name,
              email: undefined,
              avatar: course.instructor.avatar,
            };
            instructorFound = true;
          } else if (course.instructor.fullName) {
            // Objet User avec fullName
            enriched.instructor = course.instructor;
            instructorFound = true;
          } else if (course.instructor.id || course.instructor.userId) {
            // Chercher dans la liste des instructeurs par ID
            const instructorId = course.instructor.id || course.instructor.userId;
            const instructor = instructorsData.find((inst: any) => 
              Number(inst.id) === Number(instructorId) || 
              Number(inst.userId) === Number(instructorId)
            );
            if (instructor) {
              enriched.instructor = {
                id: instructor.userId || instructor.id,
                fullName: instructor.fullName || instructor.email || `Instructor #${instructor.userId || instructor.id}`,
                email: instructor.email,
                avatar: instructor.avatar,
              };
              instructorFound = true;
            }
          }
        }

        // 2. Si instructor n'est pas trouvé, chercher par instructorId dans les champs du cours
        if (!instructorFound) {
          // Le backend peut retourner instructorId dans différents champs
          // Essayer toutes les variantes possibles
          const instructorId = course.instructorId || 
                              course.instructor_id || 
                              course.instructorId || 
                              (course.instructor && typeof course.instructor === 'number' ? course.instructor : null) ||
                              (course.instructor && course.instructor.id ? course.instructor.id : null) ||
                              (course.instructor && course.instructor.userId ? course.instructor.userId : null);
          
          if (instructorId) {
            // Chercher dans la liste des instructeurs
            const instructor = instructorsData.find((inst: any) => {
              const instId = inst.id || inst.userId;
              return Number(instId) === Number(instructorId);
            });
            
            if (instructor) {
              enriched.instructor = {
                id: instructor.userId || instructor.id,
                fullName: instructor.fullName || instructor.email || `Instructor #${instructor.userId || instructor.id}`,
                email: instructor.email,
                avatar: instructor.avatar,
              };
              instructorFound = true;
            } else {
              // Log seulement pour le premier cours pour éviter le spam
              if (coursesData.indexOf(course) === 0) {
                console.warn(`Instructor with ID ${instructorId} not found in instructors list. Available instructor IDs:`, 
                  instructorsData.map((inst: any) => inst.id || inst.userId));
              }
            }
          }
        }

        // 3. Si toujours pas trouvé, essayer de récupérer depuis getCourseById (seulement pour le premier pour debug)
        if (!instructorFound && coursesData.indexOf(course) === 0) {
          console.warn("No instructor found for course:", course.id, "Course data keys:", Object.keys(course));
          // Ne pas faire d'appel API ici car c'est trop coûteux, juste logger
        }

        return enriched;
      });

      // Pour les cours qui n'ont toujours pas d'instructeur, essayer de récupérer les détails complets
      const coursesWithoutInstructor = enrichedCourses.filter(c => !c.instructor || !c.instructor.fullName);
      
      if (coursesWithoutInstructor.length > 0) {
        console.log(`Found ${coursesWithoutInstructor.length} courses without instructor, trying to fetch details...`);
        
        // Récupérer les détails complets pour les cours sans instructeur (limité aux 10 premiers pour performance)
        const coursesToFetch = coursesWithoutInstructor.slice(0, 10);
        const courseDetailsPromises = coursesToFetch.map(course => 
          courseService.getCourseById(course.id).catch(err => {
            console.warn(`Failed to fetch details for course ${course.id}:`, err);
            return null;
          })
        );
        
        try {
          const courseDetails = await Promise.all(courseDetailsPromises);
          
          // Mettre à jour les cours avec les détails récupérés
          courseDetails.forEach((details, index) => {
            if (details && details.instructor) {
              const courseIndex = enrichedCourses.findIndex(c => c.id === coursesToFetch[index].id);
              if (courseIndex !== -1) {
                if (details.instructor.name) {
                  enrichedCourses[courseIndex].instructor = {
                    id: details.instructor.id,
                    fullName: details.instructor.name,
                    email: undefined,
                    avatar: details.instructor.avatar,
                  };
                } else if (details.instructor.fullName) {
                  enrichedCourses[courseIndex].instructor = details.instructor;
                }
              }
            }
          });
        } catch (err) {
          console.error("Error fetching course details:", err);
        }
      }

      setCourses(enrichedCourses);
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: t('courses.toasts.error_load'),
        variant: "destructive",
      });
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, toast, t]);

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
          title: t('common.error'),
          description: t('courses.toasts.error_delete'),
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
        header: t('courses.list.header_course'),
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "instructor", 
        header: t('courses.list.header_instructor'),
        cell: ({ row }) => {
          const course = row.original;
          // Le backend peut retourner instructor comme InstructorDto avec 'name' ou comme User avec 'fullName'
          const instructorName = course.instructor?.name || course.instructor?.fullName;
          // Si pas de nom, vérifier si on a au moins un ID pour afficher quelque chose
          if (!instructorName && course.instructor?.id) {
            return `Instructor #${course.instructor.id}`;
          }
          return instructorName || t('common.notAvailable');
        },
      },
      {
        accessorKey: "categorie", 
        header: t('courses.list.header_category'),
        cell: ({ row }) => {
          const course = row.original;
          // Le backend peut retourner category comme string (titre) ou comme objet Categorie
          const categoryTitle = course.categorie?.title || (typeof course.category === 'string' ? course.category : null);
          return categoryTitle || t('common.notAvailable');
        },
      },
      {
        accessorKey: "students", // This still needs to be populated from backend
        header: t('courses.list.header_students'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students || 0}
          </div>
        ),
      },
      {
        accessorKey: "duration",
        header: t('courses.list.header_duration'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {row.original.duration ? convertSecondsToDurationString(row.original.duration) : t('courses.list.duration_zero')}
          </div>
        ),
      },
      {
        accessorKey: "rating", // This still needs to be populated from backend
        header: t('courses.list.header_rating'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating || 0}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t('courses.list.header_status'),
        cell: ({ row }) => {
          const statusMap: Record<string, string> = {
            "PUBLIE": t('courses.list.status_published'),
            "PUBLISHED": t('courses.list.status_published'),
            "BROUILLON": t('courses.list.status_draft'),
            "DRAFT": t('courses.list.status_draft'),
            "IN_REVIEW": t('courses.list.status_review'),
          }
          const statusText = statusMap[row.original.status] || row.original.status
          return <StatusBadge status={statusText} />
        },
      },
      {
        id: "actions",
        header: t('courses.list.header_actions'),
        cell: ({ row }) => {
          const course = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('courses.list.action_view'),
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(course),
                },
                {
                  label: t('courses.list.action_edit'),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(course),
                },
                {
                  label: course.activate ? t('courses.list.action_deactivate') : t('courses.list.action_activate'),
                  icon: <Power className="h-4 w-4" />,
                  onClick: () => handleToggleActivate(course),
                  variant: course.activate ? 'destructive' : 'default',
                },
                {
                  label: t('courses.list.action_delete'),
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
    [viewModal, editModal, deleteModal, handleToggleActivate, t]
  )

  console.log("CoursesList render - loading:", loading, "filteredData:", filteredData); // Debug log
  return (
    <>
      <PageHeader
        title={t('courses.title')}
        action={{
          label: t('courses.addCourse'),
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4 flex items-center gap-2"> {/* Added flex container */}
            <SearchBar
              placeholder={t('courses.search_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0"> {/* flex-shrink-0 to prevent button from shrinking */}
                  <ListFilter className="mr-2 h-4 w-4" />
                  {selectedCategory ? categories.find(cat => cat.id === selectedCategory)?.title : t('courses.filter_all_categories')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('courses.filter_by_category')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  {t('courses.filter_all_categories')}
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
          title={t('courses.editCourse')}
          description={t('courses.edit_description')}
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCourse}
          submitLabel={t('common.save')}
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
        title={t('courses.deleteCourse')}
        description={t('courses.delete_description').replace('{{name}}', deleteModal.selectedItem?.title || '')}
        confirmText={t('common.delete')}
        variant="destructive"
      />
    </>
  )
}
