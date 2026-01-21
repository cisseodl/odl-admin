"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { EmptyState } from "@/components/admin/empty-state"
import { 
  FileText, 
  Upload, 
  ChevronRight, 
  BookOpen, 
  PlayCircle, 
  File, 
  Code, 
  HelpCircle, 
  Loader2,
  Video,
  FlaskConical,
  FileQuestion,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { courseService, moduleService, quizService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { ModuleLessonFormModal, ModuleFormData } from "@/components/instructor/module-lesson-form-modal"
import { LessonFormModal, LessonFormData, LessonType } from "@/components/instructor/lesson-form-modal"
import { Course } from "@/models"
import { Module } from "@/models/module.model"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { ContentViewer } from "@/components/shared/content-viewer"
import { ActionMenu } from "@/components/ui/action-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useLanguage } from "@/contexts/language-context"

interface Lesson {
  id?: number
  title?: string | null
  lessonOrder?: number | null
  type?: "VIDEO" | "DOCUMENT" | "QUIZ" | "LAB" | string | null
  contentUrl?: string | null
  duration?: number | null
}

interface ModuleWithLessons extends Module {
  lessons?: Lesson[]
}

interface CourseWithContent extends Course {
  modules?: ModuleWithLessons[]
  quizzes?: any[]
}

const lessonTypeIcons = {
  VIDEO: Video,
  DOCUMENT: File,
  QUIZ: HelpCircle,
  LAB: FlaskConical,
}

const lessonTypeColors = {
  VIDEO: "bg-blue-500/10 text-blue-500",
  DOCUMENT: "bg-green-500/10 text-green-500",
  QUIZ: "bg-purple-500/10 text-purple-500",
  LAB: "bg-orange-500/10 text-orange-500",
}

export function ContentManager() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const addModuleModal = useModal();
  const editModuleModal = useModal<{ module: ModuleWithLessons; courseId: number }>();
  const deleteModuleModal = useModal<{ moduleId: number; courseId: number }>();
  const editLessonModal = useModal<{ lesson: Lesson; moduleId: number; courseId: number }>();
  const deleteLessonModal = useModal<{ lessonId: number; moduleId: number; courseId: number }>();
  const deleteQuizModal = useModal<{ quizId: number; courseId: number }>();
  const editQuizModal = useModal<{ quiz: any; courseId: number }>();
  const contentViewerModal = useModal<{ contentUrl: string; title: string; type: string }>();
  const validateCourseModal = useModal<{ courseId: number }>();
  const { toast } = useToast();

  const [courses, setCourses] = useState<CourseWithContent[]>([]);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [loadingContent, setLoadingContent] = useState<Set<number>>(new Set());
  const [loadingModules, setLoadingModules] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    fetchModules();
  }, [user, authLoading]);

  const fetchModules = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer tous les cours de l'instructeur
      const coursesData = await courseService.getCoursesByInstructorId(Number(user.id));
      setCourses(coursesData || []);
      
      // Récupérer tous les modules de tous les cours
      const allModules: ModuleWithLessons[] = [];
      if (coursesData && Array.isArray(coursesData)) {
        for (const course of coursesData) {
          try {
            const modulesResponse = await moduleService.getModulesByCourse(course.id);
            let courseModules: ModuleWithLessons[] = [];
            
            if (modulesResponse?.data) {
              courseModules = Array.isArray(modulesResponse.data) ? modulesResponse.data : [];
            } else if (Array.isArray(modulesResponse)) {
              courseModules = modulesResponse;
            }
            
            // Ajouter l'ID du cours à chaque module pour référence
            const modulesWithCourseId = courseModules.map((module: any) => ({
              ...module,
              courseId: course.id,
              courseTitle: course.title,
              lessons: module.lessons || []
            }));
            
            allModules.push(...modulesWithCourseId);
          } catch (err: any) {
            console.error(`Error loading modules for course ${course.id}:`, err);
          }
        }
      }
      
      setModules(allModules);
    } catch (err: any) {
      console.error("Failed to load modules:", err);
      setError(err.message || "Failed to load modules.");
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async (courseId: number) => {
    if (loadingContent.has(courseId)) return;

    setLoadingContent(prev => new Set(prev).add(courseId));

    try {
      // Charger les modules et leçons
      const modulesResponse = await moduleService.getModulesByCourse(courseId);
      let modules: ModuleWithLessons[] = [];
      
      if (modulesResponse?.data) {
        modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : [];
      } else if (Array.isArray(modulesResponse)) {
        modules = modulesResponse;
      }

      modules = modules.map((module: any) => ({
        ...module,
        lessons: module.lessons || []
      }));

      // Charger les quiz
      const quizzesResponse = await quizService.getQuizzesByCourseId(courseId);
      const quizzes = Array.isArray(quizzesResponse) ? quizzesResponse : [];

      // Mettre à jour le cours avec son contenu
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, modules, quizzes }
          : course
      ));

      // Ajouter le cours à la liste des cours expansés
      setExpandedCourses(prev => new Set(prev).add(courseId));
    } catch (err: any) {
      console.error(`Error loading content for course ${courseId}:`, err);
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu du cours.",
        variant: "destructive",
      });
    } finally {
      setLoadingContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleAddModule = async (data: ModuleFormData) => {
    try {
      const selectedCourse = courses.find(c => c.id === data.courseId);
      const courseLevel = selectedCourse?.level || "DEBUTANT";
      
      const payload = {
        courseId: data.courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: [
          {
            title: data.title,
            description: data.description || "",
            moduleOrder: data.moduleOrder,
            lessons: data.lessons.map(lesson => {
              const { contentFile, quizId, ...lessonPayload } = lesson;
              return {
                title: lessonPayload.title,
                lessonOrder: lessonPayload.lessonOrder,
                type: lessonPayload.type,
                ...(lessonPayload.contentUrl && lessonPayload.contentUrl.trim() && { contentUrl: lessonPayload.contentUrl }),
                ...(lessonPayload.duration && lessonPayload.duration > 0 && { duration: lessonPayload.duration }),
              };
            }),
          },
        ],
      };
      
      const response = await moduleService.saveModules(payload);
      
      toast({
        title: "Succès",
        description: response.message || "Le module a été créé avec succès.",
      });
      
      await fetchModules();
      addModuleModal.close();
      setError(null);
    } catch (err: any) {
      console.error("Error adding module:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le module.",
        variant: "destructive",
      });
      setError(err.message || "Failed to add module.");
    }
  };

  const handleEditModule = async (data: ModuleFormData) => {
    if (!editModuleModal.selectedItem) return;
    
    try {
      const { module, courseId } = editModuleModal.selectedItem;
      const selectedCourse = courses.find(c => c.id === courseId);
      const courseLevel = selectedCourse?.level || "DEBUTANT";
      
      // Pour modifier, on doit envoyer tous les modules du cours avec le module modifié
      const currentModules = courses.find(c => c.id === courseId)?.modules || [];
      const updatedModules = currentModules.map(m => 
        m.id === module.id 
          ? {
              ...m,
              title: data.title,
              description: data.description || "",
              moduleOrder: data.moduleOrder,
              lessons: data.lessons.map(lesson => {
                const { contentFile, quizId, ...lessonPayload } = lesson;
                return {
                  id: lessonPayload.id,
                  title: lessonPayload.title,
                  lessonOrder: lessonPayload.lessonOrder,
                  type: lessonPayload.type,
                  ...(lessonPayload.contentUrl && lessonPayload.contentUrl.trim() && { contentUrl: lessonPayload.contentUrl }),
                  ...(lessonPayload.duration && lessonPayload.duration > 0 && { duration: lessonPayload.duration }),
                };
              }),
            }
          : m
      );
      
      const payload = {
        courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: updatedModules,
      };
      
      const response = await moduleService.saveModules(payload);
      
      toast({
        title: "Succès",
        description: response.message || "Le module a été modifié avec succès.",
      });
      
      await fetchModules();
      editModuleModal.close();
    } catch (err: any) {
      console.error("Error editing module:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de modifier le module.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async () => {
    if (!deleteModuleModal.selectedItem) return;
    
    try {
      const { moduleId, courseId } = deleteModuleModal.selectedItem;
      const selectedCourse = courses.find(c => c.id === courseId);
      const courseLevel = selectedCourse?.level || "DEBUTANT";
      
      // Pour supprimer, on envoie tous les modules sauf celui à supprimer
      const currentModules = courses.find(c => c.id === courseId)?.modules || [];
      const updatedModules = currentModules
        .filter(m => m.id !== moduleId)
        .map(m => ({
          ...m,
          lessons: m.lessons?.map(l => ({
            id: l.id,
            title: l.title,
            lessonOrder: l.lessonOrder,
            type: l.type,
            contentUrl: l.contentUrl,
            duration: l.duration,
          })) || [],
        }));
      
      const payload = {
        courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: updatedModules,
      };
      
      const response = await moduleService.saveModules(payload);
      
      toast({
        title: "Succès",
        description: response.message || "Le module a été supprimé avec succès.",
      });
      
      await fetchModules();
      deleteModuleModal.close();
    } catch (err: any) {
      console.error("Error deleting module:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer le module.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteLessonModal.selectedItem) return;
    
    try {
      const { lessonId, moduleId, courseId } = deleteLessonModal.selectedItem;
      const selectedCourse = courses.find(c => c.id === courseId);
      const courseLevel = selectedCourse?.level || "DEBUTANT";
      
      // Pour supprimer une leçon, on envoie tous les modules avec la leçon supprimée
      const currentModules = courses.find(c => c.id === courseId)?.modules || [];
      const updatedModules = currentModules.map(m => 
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons?.filter(l => l.id !== lessonId).map(l => ({
                id: l.id,
                title: l.title,
                lessonOrder: l.lessonOrder,
                type: l.type,
                contentUrl: l.contentUrl,
                duration: l.duration,
              })) || [],
            }
          : {
              ...m,
              lessons: m.lessons?.map(l => ({
                id: l.id,
                title: l.title,
                lessonOrder: l.lessonOrder,
                type: l.type,
                contentUrl: l.contentUrl,
                duration: l.duration,
              })) || [],
            }
      );
      
      const payload = {
        courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: updatedModules,
      };
      
      const response = await moduleService.saveModules(payload);
      
      toast({
        title: "Succès",
        description: response.message || "La leçon a été supprimée avec succès.",
      });
      
      await fetchModules();
      deleteLessonModal.close();
    } catch (err: any) {
      console.error("Error deleting lesson:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer la leçon.",
        variant: "destructive",
      });
    }
  };

  const handleValidateCourse = async (action: "APPROVE" | "REJECT", reason?: string) => {
    if (!validateCourseModal.selectedItem) return;
    
    try {
      const { courseId } = validateCourseModal.selectedItem;
      await courseService.validateCourse(courseId, action, reason);
      
      toast({
        title: "Succès",
        description: action === "APPROVE" 
          ? "Le cours a été publié avec succès." 
          : "Le cours a été rejeté.",
      });
      
      await fetchModules();
      validateCourseModal.close();
    } catch (err: any) {
      console.error("Error validating course:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de valider le cours.",
        variant: "destructive",
      });
    }
  };

  const lessonTypeLabels = {
    VIDEO: "Vidéo",
    DOCUMENT: "Document",
    QUIZ: "Quiz",
    LAB: "Lab",
  };

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        {error}
      </div>
    )
  }

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
        <CardContent className="pt-6">
          {modules.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucun module disponible"
              description="Créez votre premier module pour commencer à organiser vos leçons."
            />
          ) : (
            <div className="space-y-4">
              {modules.map((module) => {
                const isExpanded = expandedModules.has(module.id!);
                const course = courses.find(c => c.id === (module as any).courseId);
                
                return (
                  <Card key={module.id} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleModule(module.id!)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <ChevronRight 
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {course?.title && (
                                <span className="text-xs text-muted-foreground">
                                  Formation: {course.title}
                                </span>
                              )}
                              {module.description && (
                                <span className="ml-2">{module.description}</span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {module.lessons && module.lessons.length > 0 && (
                            <Badge variant="secondary">
                              {module.lessons.length === 1
                                ? `${module.lessons.length} leçon`
                                : `${module.lessons.length} leçons`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && module.lessons && module.lessons.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {module.lessons
                            .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0))
                            .map((lesson) => {
                              const lessonType = (lesson.type || "DOCUMENT") as keyof typeof lessonTypeIcons
                              const LessonIcon = lessonTypeIcons[lessonType] || FileText
                              const typeColor = lessonTypeColors[lessonType] || lessonTypeColors.DOCUMENT
                              const typeLabel = lessonTypeLabels[lessonType] || "Document"
                              
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                                >
                                  <LessonIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">
                                        {lesson.title || "Sans titre"}
                                      </span>
                                      <Badge 
                                        variant="secondary" 
                                        className={typeColor}
                                      >
                                        {typeLabel}
                                      </Badge>
                                    </div>
                                    {lesson.duration && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Durée: {lesson.duration} min
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {lesson.contentUrl && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const lowerUrl = lesson.contentUrl!.toLowerCase()
                                            const isWord = lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx') || 
                                                          lowerUrl.includes('.doc') || lowerUrl.includes('.docx')
                                            if (isWord) {
                                              window.open(lesson.contentUrl!, '_blank')
                                            } else {
                                              contentViewerModal.open({
                                                contentUrl: lesson.contentUrl!,
                                                title: lesson.title || "Contenu",
                                                type: lesson.type || "DOCUMENT"
                                              })
                                            }
                                          }}
                                        >
                                          <PlayCircle className="h-4 w-4 mr-1" />
                                          Ouvrir
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.open(lesson.contentUrl!, '_blank')}
                                          title="Ouvrir dans un nouvel onglet"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                    <ActionMenu
                                      actions={[
                                        {
                                          label: t('common.edit') || "Modifier",
                                          icon: <Edit className="h-4 w-4" />,
                                          onClick: () => editLessonModal.open({
                                            lesson: lesson,
                                            moduleId: module.id!,
                                            courseId: (module as any).courseId,
                                          }),
                                        },
                                        {
                                          label: t('common.delete') || "Supprimer",
                                          icon: <Trash2 className="h-4 w-4" />,
                                          onClick: () => deleteLessonModal.open({
                                            lessonId: lesson.id!,
                                            moduleId: module.id!,
                                            courseId: (module as any).courseId,
                                          }),
                                          variant: "destructive",
                                        },
                                      ]}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-4">
                          <ActionMenu
                            actions={[
                              {
                                label: "Modifier",
                                icon: <Edit className="h-4 w-4" />,
                                onClick: () => editModuleModal.open({ module, courseId: (module as any).courseId }),
                              },
                              {
                                label: "Supprimer",
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => deleteModuleModal.open({ moduleId: module.id!, courseId: (module as any).courseId }),
                                variant: "destructive",
                              },
                            ]}
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

        <ModuleLessonFormModal
        open={addModuleModal.isOpen}
        onOpenChange={addModuleModal.close}
        title={t('content.modals.add_module_title') || "Ajouter un nouveau module"}
        description={t('content.modals.add_module_description') || "Remplissez les informations pour créer un nouveau module dans votre formation."}
        onSubmit={handleAddModule}
        submitLabel={t('content.modals.add_module_submit') || "Ajouter le module"}
        courses={courses}
      />

      {editModuleModal.selectedItem && (
        <ModuleLessonFormModal
          open={editModuleModal.isOpen}
          onOpenChange={editModuleModal.close}
          title={t('content.modals.edit_module_title') || "Modifier le module"}
          description={t('content.modals.edit_module_description') || "Modifiez les informations du module."}
          onSubmit={handleEditModule}
          submitLabel={t('content.modals.edit_module_submit') || "Modifier le module"}
          courses={courses}
          defaultValues={{
            courseId: editModuleModal.selectedItem.courseId,
            title: editModuleModal.selectedItem.module.title || "",
            description: editModuleModal.selectedItem.module.description || "",
            moduleOrder: editModuleModal.selectedItem.module.moduleOrder || 1,
            lessons: editModuleModal.selectedItem.module.lessons?.map(l => ({
              id: l.id,
              title: l.title || "",
              lessonOrder: l.lessonOrder || 1,
              type: l.type as any,
              contentUrl: l.contentUrl || "",
              duration: l.duration || undefined,
            })) || [],
          }}
        />
      )}

      <ConfirmDialog
        open={deleteModuleModal.isOpen}
        onOpenChange={deleteModuleModal.close}
        title={t('content.modals.delete_module_title') || "Supprimer le module"}
        description={t('content.modals.delete_module_description') || "Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible."}
        confirmText={t('common.delete') || "Supprimer"}
        onConfirm={handleDeleteModule}
        variant="destructive"
      />

      {contentViewerModal.selectedItem && (
        <ContentViewer
          open={contentViewerModal.isOpen}
          onOpenChange={contentViewerModal.close}
          contentUrl={contentViewerModal.selectedItem.contentUrl}
          title={contentViewerModal.selectedItem.title}
          type={contentViewerModal.selectedItem.type as any}
        />
      )}

      {editLessonModal.selectedItem && (
        <LessonFormModal
          open={editLessonModal.isOpen}
          onOpenChange={editLessonModal.close}
          title={t('instructor.lessons.modals.edit_title') || "Modifier la leçon"}
          description={t('instructor.lessons.modals.edit_description') || "Modifiez les informations de la leçon"}
          submitLabel={t('instructor.lessons.modals.edit_submit') || "Enregistrer"}
          defaultValues={{
            title: editLessonModal.selectedItem.lesson.title || "",
            lessonOrder: editLessonModal.selectedItem.lesson.lessonOrder || 1,
            type: (editLessonModal.selectedItem.lesson.type as LessonType) || LessonType.DOCUMENT,
            contentUrl: editLessonModal.selectedItem.lesson.contentUrl || "",
            duration: editLessonModal.selectedItem.lesson.duration || undefined,
          }}
          onSubmit={handleUpdateLesson}
        />
      )}

      <ConfirmDialog
        open={deleteLessonModal.isOpen}
        onOpenChange={deleteLessonModal.close}
        title={t('instructor.lessons.modals.delete_title') || "Supprimer la leçon"}
        description={t('instructor.lessons.modals.delete_description') || "Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible."}
        confirmText={t('instructor.lessons.modals.delete_confirm') || "Supprimer"}
        onConfirm={handleDeleteLesson}
        variant="destructive"
      />

      <ConfirmDialog
        open={validateCourseModal.isOpen}
        onOpenChange={validateCourseModal.close}
        title="Valider le cours"
        description="Voulez-vous valider ce cours ? Il sera publié et visible par tous les apprenants."
        onConfirm={() => handleValidateCourse("APPROVE")}
      />
    </>
  )
}
