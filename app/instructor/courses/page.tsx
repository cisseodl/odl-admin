"use client"

import { CoursesManager } from "@/components/instructor/courses-manager"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { useModal } from "@/hooks/use-modal"
import { CourseFormModal, CourseFormData } from "@/components/shared/course-form-modal"
import { courseService, categorieService } from "@/services"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Categorie } from "@/models"

export default function InstructorCoursesPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()
  const addCourseModal = useModal()
  const [categories, setCategories] = useState<Categorie[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

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
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories.",
        variant: "destructive",
      })
    }
  }

  const handleAddCourse = async (data: CourseFormData) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié.",
        variant: "destructive",
      })
      return
    }
    if (!data.categoryId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie.",
        variant: "destructive",
      })
      return
    }
    try {
      const coursePayload = {
        ...data,
        instructorId: Number(user.id),
      }
      const createdCourse = await courseService.createCourse(
        data.categoryId,
        coursePayload,
        data.imageFile
      )
      if (createdCourse) {
        toast({
          title: "Succès",
          description: "Cours créé avec succès.",
        })
        addCourseModal.close()
        window.location.reload()
      }
    } catch (error: any) {
      console.error("Error creating course:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le cours.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('instructor.courses.title') || "Cours"}
        description={t('instructor.courses.description') || "Créez et gérez vos cours. Sélectionnez la catégorie adaptée lors de la création."}
        action={{
          label: t('courses.actions.create') || "Créer un cours",
          onClick: addCourseModal.open,
        }}
      />
      <CoursesManager />
      <CourseFormModal
        open={addCourseModal.isOpen}
        onOpenChange={(open) => !open && addCourseModal.close()}
        title={t('courses.actions.create') || "Créer un cours"}
        description={t('courses.create_description') || "Créez un nouveau cours et sélectionnez la catégorie adaptée."}
        onSubmit={handleAddCourse}
        submitLabel={t('courses.actions.create') || "Créer un cours"}
        categories={categories}
      />
    </div>
  )
}

