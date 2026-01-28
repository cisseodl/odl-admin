"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, BookOpen, Users, Star, FileText, Video, Clock } from "lucide-react"
import { CourseFormModal, type CourseFormData } from "@/components/shared/course-form-modal"
import { ViewCourseModal } from "@/components/admin/modals/view-course-modal"
import { courseService, categorieService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { Course, Categorie } from "@/models"

type CourseDisplay = {
  id: number
  title: string
  subtitle?: string
  description?: string
  status: string
  modules: number
  chapters: number
  videos: number
  students: number
  rating: number
  createdAt: string
  categoryId?: number
  level?: string
  language?: string
  imagePath?: string
}

export function InstructorFormationsList() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { user } = useAuth()
  const addModal = useModal<CourseDisplay>()
  const editModal = useModal<CourseDisplay>()
  const deleteModal = useModal<CourseDisplay>()
  const viewModal = useModal<CourseDisplay>()

  const [courses, setCourses] = useState<CourseDisplay[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const coursesData = await courseService.getCoursesByInstructorId(Number(user.id))
      
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        const mapped: CourseDisplay[] = coursesData.map((c: any) => ({
          id: c.id,
          title: c.title || "Sans titre",
          subtitle: c.subtitle,
          description: c.description,
          status:
            c.status === "PUBLISHED" || c.status === "PUBLIE" || c.status === "Publié"
              ? "Publié"
              : c.status === "DRAFT" || c.status === "BROUILLON" || c.status === "Brouillon"
              ? "Brouillon"
              : c.status === "IN_REVIEW" || c.status === "En révision"
              ? "En révision"
              : "Brouillon",
          modules: Array.isArray(c.modules) ? c.modules.length : 0,
          chapters: Array.isArray(c.modules)
            ? c.modules.reduce(
                (acc: number, m: any) =>
                  acc + (Array.isArray(m.lessons) ? m.lessons.length : 0),
                0
              )
            : 0,
          videos: 0,
          students: c.studentsCount || 0,
          rating: c.averageRating || 0,
          createdAt: c.createdAt
            ? new Date(c.createdAt).toLocaleDateString("fr-FR")
            : "",
          categoryId: c.categorie?.id || c.categoryId,
          level: c.level,
          language: c.language,
          imagePath: c.imagePath || c.image,
        }))
        setCourses(mapped)
      } else {
        setCourses([])
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err)
      setError(err.message || t('courses.toasts.error_load') || "Impossible de charger les formations.")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categorieService.getAllCategories()
      if (Array.isArray(response)) {
        setCategories(response)
      } else if (response && Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        setCategories([])
      }
    } catch (err) {
      console.error("Failed to load categories:", err)
      setCategories([])
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchCourses()
      fetchCategories()
    }
  }, [user?.id])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<CourseDisplay>({
    data: courses,
    searchKeys: ["title", "description"],
  })

  const handleAddCourse = async (data: CourseFormData) => {
    setError(null)
    try {
      // Extraire categoryId et imageFile des données du formulaire
      const { categoryId, imageFile, ...courseDataRest } = data as CourseFormData & { imageFile?: File };

      if (!categoryId) {
        throw new Error("La catégorie est obligatoire pour créer un cours.");
      }
      
      const response = await courseService.createCourse(
        categoryId, // Pass categoryId as the first argument
        courseDataRest, // Pass the rest of the course data
        imageFile // Pass imageFile separately
      )
      
      if (response) {
        toast({
          title: t('courses.toasts.success_create') || "Succès",
          description: t('courses.toasts.create_success') || "Formation créée avec succès.",
        })
        addModal.close()
        await fetchCourses()
      }
    } catch (err: any) {
      console.error("Error adding course:", err)
      toast({
        title: t('courses.toasts.error_create') || "Erreur",
        description: err.message || t('courses.toasts.create_error') || "Impossible de créer la formation.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCourse = async (data: CourseFormData) => {
    setError(null)
    if (editModal.selectedItem) {
      try {
        const { categoryId, ...courseData } = data
        const response = await courseService.updateCourse(editModal.selectedItem.id, courseData)
        
        if (response) {
          toast({
            title: t('courses.toasts.success_update') || "Succès",
            description: t('courses.toasts.update_success') || "Formation mise à jour avec succès.",
          })
          editModal.close()
          await fetchCourses()
        }
      } catch (err: any) {
        console.error("Error updating course:", err)
        toast({
          title: t('courses.toasts.error_update') || "Erreur",
          description: err.message || t('courses.toasts.update_error') || "Impossible de mettre à jour la formation.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteCourse = async () => {
    setError(null)
    if (deleteModal.selectedItem) {
      try {
        await courseService.deleteCourse(deleteModal.selectedItem.id)
        toast({
          title: t('courses.toasts.success_delete') || "Succès",
          description: t('courses.toasts.delete_success') || "Formation supprimée avec succès.",
        })
        setCourses((prev) => prev.filter((course) => course.id !== deleteModal.selectedItem.id))
        deleteModal.close()
      } catch (err: any) {
        console.error("Error deleting course:", err)
        toast({
          title: t('courses.toasts.error_delete') || "Erreur",
          description: err.message || t('courses.toasts.delete_error') || "Impossible de supprimer la formation.",
          variant: "destructive",
        })
      }
    }
  }

  const columns: ColumnDef<CourseDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t('courses.list.header_course') || "Formation",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "modules",
        header: t('courses.modules') || "Modules",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.modules}
          </div>
        ),
      },
      {
        accessorKey: "chapters",
        header: t('courses.chapters') || "Chapitres",
      },
      {
        accessorKey: "students",
        header: t('courses.list.header_students') || "Étudiants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students}
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: t('courses.list.header_rating') || "Note",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating.toFixed(1)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t('courses.list.header_status') || "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: t('courses.list.header_created') || "Date de création",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.createdAt}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('common.actions') || "Actions",
        cell: ({ row }) => {
          const course = row.original
          const courseForModal: any = {
            id: course.id,
            title: course.title,
            subtitle: course.subtitle,
            description: course.description,
            imagePath: course.imagePath,
            duration: 0,
            level: course.level,
            language: course.language,
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
          }
          return (
            <ActionMenu
              actions={[
                {
                  label: t('common.view') || "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(courseForModal),
                },
                {
                  label: t('common.edit') || "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(course),
                },
                {
                  label: t('common.delete') || "Supprimer",
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
    [t, viewModal, editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title={t('routes.instructor_formations') || "Formations"}
        action={{
          label: t('courses.actions.create') || "Ajouter une formation",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('courses.search_placeholder') || "Rechercher une formation..."}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t('courses.list.empty_title') || "Aucune formation"}
              description={t('courses.list.empty_description') || "Commencez par ajouter une formation"}
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <CourseFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title={t('courses.actions.create') || "Ajouter une formation"}
        description={t('courses.create_description') || "Créez une nouvelle formation"}
        onSubmit={handleAddCourse}
        submitLabel={t('courses.actions.create') || "Créer la formation"}
        categories={categories}
      />

      {editModal.selectedItem && (
        <CourseFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('courses.actions.edit') || "Modifier la formation"}
          description={t('courses.edit_description') || "Modifiez les informations de la formation"}
          defaultValues={{
            title: editModal.selectedItem.title,
            subtitle: editModal.selectedItem.subtitle || "",
            description: editModal.selectedItem.description || "",
            level: (editModal.selectedItem.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED") || "BEGINNER",
            language: editModal.selectedItem.language || "",
            categoryId: editModal.selectedItem.categoryId || 0,
          }}
          onSubmit={handleUpdateCourse}
          submitLabel={t('courses.actions.edit') || "Enregistrer les modifications"}
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
        title={t('courses.modals.delete_title') || "Supprimer la formation"}
        description={t('courses.modals.delete_description', { name: deleteModal.selectedItem?.title }) || `Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.title} ? Cette action est irréversible.`}
        confirmText={t('common.delete') || "Supprimer"}
        variant="destructive"
      />
    </>
  )
}
