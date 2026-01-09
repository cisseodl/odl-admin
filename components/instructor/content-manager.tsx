"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { EmptyState } from "@/components/admin/empty-state"
import { FileText, Upload } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { courseService, moduleService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { ModuleLessonFormModal, ModuleFormData } from "@/components/instructor/module-lesson-form-modal"
import { Course } from "@/models"

export function ContentManager() {
  const { user, isLoading: authLoading } = useAuth();
  const addModuleModal = useModal();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await courseService.getCoursesByInstructorId(Number(user.id));
        setCourses(data || []);
      } catch (err: any) {
        console.error("Failed to load courses:", err);
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, authLoading]);

  const handleAddModule = async (data: ModuleFormData) => {
    try {
      // The endpoint POST /modules/save expects a JSON object with courseId and an array of modules
      const payload = {
        courseId: data.courseId,
        modules: [
          {
            title: data.title,
            moduleOrder: data.moduleOrder,
            lessons: data.lessons.map(lesson => ({
              title: lesson.title,
              lessonOrder: lesson.lessonOrder,
              type: lesson.type,
              ...(lesson.contentUrl && { contentUrl: lesson.contentUrl }),
              ...(lesson.duration && { duration: lesson.duration }),
            })),
          },
        ],
      };
      await moduleService.saveModules(payload);
      addModuleModal.close();
      // Optionally, refresh a list of modules if displayed here, or redirect
    } catch (err: any) {
      setError(err.message || "Failed to add module.");
    }
  };

  return (
    <>
      <PageHeader
        title="Gestion des Modules et Leçons"
        description="Créez et organisez les modules et leçons de vos formations"
        action={{
          label: "Ajouter un module",
          icon: <Upload className="h-4 w-4" />,
          onClick: addModuleModal.open,
        }}
      />

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucune formation disponible"
              description="Veuillez d'abord créer une formation pour pouvoir y ajouter des modules."
            />
          ) : (
            // In the future, this area could list existing modules and lessons
            <div className="p-4 text-center text-muted-foreground">
              Utilisez le bouton "Ajouter un module" pour commencer à organiser votre contenu.
            </div>
          )}
        </CardContent>
      </Card>

      <ModuleLessonFormModal
        open={addModuleModal.isOpen}
        onOpenChange={addModuleModal.close}
        title="Ajouter un nouveau module"
        description="Remplissez les informations pour créer un nouveau module dans votre formation."
        onSubmit={handleAddModule}
        submitLabel="Ajouter le module"
        courses={courses}
      />
    </>
  )
}
