"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
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
import { AddCourseModal, type AddCoursePayload } from "@/components/admin/modals/add-course-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewCourseModal } from "./modals/view-course-modal"
import { CourseFormModal } from "@/components/shared/course-form-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Power, Users, Clock, Star, BookOpen, ListFilter } from "lucide-react"
import type { CourseFormData } from "@/lib/validations/course"
import { Course as CourseModel, Categorie } from "@/models"
import { courseService, categorieService, instructorService } from "@/services"
import { convertDurationToSeconds, convertSecondsToDurationString } from "@/lib/utils"
import { PageLoader } from "@/components/ui/page-loader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type CourseDisplay = CourseModel

export function CoursesList() {
  const { t } = useLanguage()
  const addModal = useModal<CourseDisplay>()
  const editModal = useModal<CourseDisplay>()
  const deleteModal = useModal<CourseDisplay>()
  const viewModal = useModal<CourseDisplay>()
  const { toast } = useToast()

  const [courses, setCourses] = useState<CourseDisplay[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL") // "ALL", "PUBLISHED", "UNPUBLISHED"
  const [loading, setLoading] = useState(true)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const [categoriesResponse, instructorsResponse] = await Promise.all([
        categorieService.getAllCategories(),
        instructorService.getAllInstructors(),
      ])

      let categoriesData: Categorie[] = []
      if (Array.isArray(categoriesResponse)) {
        categoriesData = categoriesResponse
        setCategories(categoriesData)
      } else if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
        categoriesData = categoriesResponse.data
        setCategories(categoriesData)
      }

      let instructorsData: any[] = []
      if (instructorsResponse) {
        if (Array.isArray(instructorsResponse.data)) {
          instructorsData = instructorsResponse.data
        } else if (Array.isArray(instructorsResponse)) {
          instructorsData = instructorsResponse
        }
      }
      setInstructors(instructorsData)

      // Admin : uniquement Tous / Publié / Non publié (évite l'erreur 500 sur liste de statuts)
      let statusFilter: string | string[] | undefined
      switch (selectedStatus) {
        case "PUBLISHED":
          statusFilter = "PUBLIE"
          break
        case "UNPUBLISHED":
          statusFilter = ["BROUILLON", "IN_REVIEW"]
          break
        case "ALL":
        default:
          statusFilter = undefined
          break
      }

      let coursesResponse
      if (selectedCategory) {
        coursesResponse = await courseService.getCoursesByCategory(selectedCategory)
      } else {
        coursesResponse = await courseService.getAllCourses(statusFilter !== undefined ? { status: statusFilter } : {})
      }

      let coursesData: any[] = []
      if (Array.isArray(coursesResponse)) {
        coursesData = coursesResponse
      } else if (coursesResponse && Array.isArray(coursesResponse.data)) {
        coursesData = coursesResponse.data
      }

      let enrichedCourses = coursesData.map((course: any) => {
        const enriched: CourseDisplay = { ...course }
        const category = categoriesData.find((cat) => cat.id === course.categoryId)
        if (category) enriched.categorie = category
        const instructor = instructorsData.find(
          (inst) => inst.id === course.instructorId || inst.userId === course.instructorId
        )
        if (instructor)
          enriched.instructor = {
            id: instructor.userId || instructor.id,
            fullName: instructor.fullName || instructor.email,
            email: instructor.email,
            avatar: instructor.avatar,
          }
        return enriched
      })

      // Filtrage local si on a filtré par catégorie
      if (selectedCategory && selectedStatus !== "ALL") {
        enrichedCourses = enrichedCourses.filter(course => {
            const status = course.status?.toUpperCase();
            if (selectedStatus === 'PUBLISHED') return status === 'PUBLISHED' || status === 'PUBLIE';
            if (selectedStatus === 'UNPUBLISHED') return status === 'DRAFT' || status === 'IN_REVIEW' || status === 'BROUILLON';
            return true;
        })
      }


      setCourses(enrichedCourses)
    } catch (err: any) {
      toast({
        title: t("common.error"),
        description: t("courses.toasts.error_load"),
        variant: "destructive",
      })
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedStatus, toast, t])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<CourseDisplay>({
    data: courses,
    searchKeys: ["title", "instructor.fullName", "categorie.title"],
  })

  const handleAddCourse = async (payload: AddCoursePayload) => {
    try {
      const { categoryId, instructorId, title } = payload
      const courseData = {
        title,
        instructorId,
        categoryId,
        subtitle: title,
        description: "",
        level: "BEGINNER",
        language: "fr",
        objectives: [] as string[],
        features: [] as string[],
        modules: [] as any[],
      }
      await courseService.createCourse(categoryId, courseData)
      addModal.close()
      toast({
        title: "Succès",
        description: "Le cours a été créé. L'instructeur pourra ajouter les modules, leçons et quiz, puis publier.",
      })
      await fetchCourses()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message ?? "Impossible de créer le cours.",
        variant: "destructive",
      })
    }
  }

  // ... (autres handlers: handleUpdateCourse, handleDeleteCourse, etc.)
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
      // ... columns definition from your original file
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
          const instructorName = course.instructor?.fullName;
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
          const categoryTitle = course.categorie?.title;
          return categoryTitle || t('common.notAvailable');
        },
      },
      {
        accessorKey: "students",
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
        cell: ({ row }) => {
          const course = row.original;
          let durationDisplay = typeof course.duration === 'number' ? convertSecondsToDurationString(course.duration) : t('courses.list.duration_zero');
          return (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {durationDisplay}
            </div>
          );
        },
      },
      {
        accessorKey: "rating",
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
          // Admin : afficher uniquement Publié ou Non publié
          const s = (row.original.status || "").toUpperCase()
          const statusText = s === "PUBLIE" || s === "PUBLISHED" ? t('courses.list.status_published') : t('courses.list.status_unpublished')
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
                { label: t('courses.list.action_view'), icon: <Eye className="h-4 w-4" />, onClick: () => viewModal.open(course) },
                { label: t('courses.list.action_edit'), icon: <Edit className="h-4 w-4" />, onClick: () => editModal.open(course) },
                { label: course.activate ? t('courses.list.action_deactivate') : t('courses.list.action_activate'), icon: <Power className="h-4 w-4" />, onClick: () => handleToggleActivate(course), variant: course.activate ? 'destructive' : 'default' },
                { label: t('courses.list.action_delete'), icon: <Trash2 className="h-4 w-4" />, onClick: () => deleteModal.open(course), variant: "destructive" },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal, handleToggleActivate, t]
  )

  return (
    <>
      <PageHeader
        title={t("courses.title")}
        action={{
          label: t("courses.addCourse"),
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <SearchBar
              placeholder={t("courses.search_placeholder")}
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Filtre par Statut */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <ListFilter className="mr-2 h-4 w-4" />
                  {selectedStatus === 'PUBLISHED' && "Publiés"}
                  {selectedStatus === 'UNPUBLISHED' && "Non publiés"}
                  {selectedStatus === 'ALL' && "Tous les statuts"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedStatus("ALL")}>Tous les statuts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("PUBLISHED")}>Publiés</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("UNPUBLISHED")}>Non publiés</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtre par Catégorie */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <ListFilter className="mr-2 h-4 w-4" />
                  {selectedCategory
                    ? categories.find((cat) => cat.id === selectedCategory)?.title
                    : t("courses.filter_all_categories")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("courses.filter_by_category")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  {t("courses.filter_all_categories")}
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
      <AddCourseModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        onAddCourse={handleAddCourse}
        categories={categories}
        instructors={instructors}
      />

      {editModal.selectedItem && (
        <CourseFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t("courses.editCourse")}
          description={t("courses.edit_description")}
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCourse}
          submitLabel={t("common.save")}
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
        title={t("courses.deleteCourse")}
        description={t("courses.delete_description").replace("{{name}}", deleteModal.selectedItem?.title || "")}
        confirmText={t("common.delete")}
        variant="destructive"
      />
    </>
  )
}