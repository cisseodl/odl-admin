"use client"

import { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Video, 
  File, 
  HelpCircle, 
  FlaskConical,
  PlayCircle,
  FileQuestion,
  Loader2
} from "lucide-react"
import { courseService, moduleService, quizService } from "@/services"
import { Course } from "@/models"
import { PageLoader } from "@/components/ui/page-loader"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useModal } from "@/hooks/use-modal"
import { ModuleLessonFormModal, ModuleFormData } from "@/components/instructor/module-lesson-form-modal"
import { ActionMenu } from "@/components/ui/action-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Edit, Trash2 } from "lucide-react"
import { ContentViewer } from "@/components/shared/content-viewer"

interface Module {
  id: number
  title: string
  description?: string
  moduleOrder: number
  lessons?: Lesson[]
}

interface Lesson {
  id: number
  title?: string | null
  lessonOrder?: number | null
  type?: "VIDEO" | "QUIZ" | "DOCUMENT" | "LAB" | string | null
  contentUrl?: string | null
  duration?: number | null
}

interface Quiz {
  id: number
  title?: string
  titre?: string // Backend peut utiliser titre
  description?: string
  durationMinutes?: number
  dureeMinutes?: number // Backend peut utiliser dureeMinutes
  scoreMinimum?: number
}

interface CourseWithContent extends Course {
  modules?: Module[]
  quizzes?: Quiz[]
}

const lessonTypeIcons = {
  VIDEO: Video,
  DOCUMENT: File,
  QUIZ: HelpCircle,
  LAB: FlaskConical,
}

// lessonTypeLabels sera défini dans le composant pour utiliser t()

const lessonTypeColors = {
  VIDEO: "bg-blue-500/10 text-blue-500",
  DOCUMENT: "bg-green-500/10 text-green-500",
  QUIZ: "bg-purple-500/10 text-purple-500",
  LAB: "bg-orange-500/10 text-orange-500",
}

export function ContentManager() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const addModuleModal = useModal<{ courseId: number }>()
  const editModuleModal = useModal<{ module: Module; courseId: number }>()
  const deleteModuleModal = useModal<{ moduleId: number; courseId: number }>()
  const deleteLessonModal = useModal<{ lessonId: number; moduleId: number; courseId: number }>()
  const deleteQuizModal = useModal<{ quizId: number; courseId: number }>()
  const contentViewerModal = useModal<{ contentUrl: string; title: string; type: string }>()
  const editQuizModal = useModal<{ quiz: Quiz; courseId: number }>()
  
  const [courses, setCourses] = useState<CourseWithContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())
  const [loadingContent, setLoadingContent] = useState<Set<number>>(new Set())
  const [modulesByCourse, setModulesByCourse] = useState<Map<number, Module[]>>(new Map())

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await courseService.getAllCourses()
      const coursesData = Array.isArray(response) ? response : (response?.data || [])
      setCourses(coursesData)
    } catch (err: any) {
      console.error("Error fetching courses:", err)
      setError(err.message || t('content.errors.load_failed'))
      toast({
        title: t('common.error'),
        description: t('content.errors.load_failed'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCourseContent = async (courseId: number) => {
    if (loadingContent.has(courseId)) return

    setLoadingContent(prev => new Set(prev).add(courseId))

    try {
      // Charger les modules et leçons
      const modulesResponse = await moduleService.getModulesByCourse(courseId)
      console.log("Modules response:", modulesResponse)
      
      let modules = []
      if (modulesResponse?.data) {
        modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : []
      } else if (Array.isArray(modulesResponse)) {
        modules = modulesResponse
      }
      
      // S'assurer que les leçons sont bien présentes dans chaque module
      modules = modules.map((module: any) => ({
        ...module,
        lessons: module.lessons || []
      }))
      
      console.log("Modules avec leçons:", modules)

      // Charger les quiz
      const quizzesResponse = await quizService.getQuizzesByCourseId(courseId)
      const quizzes = Array.isArray(quizzesResponse) ? quizzesResponse : []
      console.log("Quiz response:", quizzes)

      // Mettre à jour le cours avec son contenu
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, modules, quizzes }
          : course
      ))

      // Ajouter le cours à la liste des cours expansés
      setExpandedCourses(prev => new Set(prev).add(courseId))
    } catch (err: any) {
      console.error(`Error loading content for course ${courseId}:`, err)
      toast({
        title: t('common.error'),
        description: t('content.errors.load_content_failed'),
        variant: "destructive",
      })
    } finally {
      setLoadingContent(prev => {
        const newSet = new Set(prev)
        newSet.delete(courseId)
        return newSet
      })
    }
  }

  const toggleCourse = (courseId: number) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return

    if (expandedCourses.has(courseId)) {
      // Fermer
      setExpandedCourses(prev => {
        const newSet = new Set(prev)
        newSet.delete(courseId)
        return newSet
      })
    } else {
      // Ouvrir et charger le contenu si nécessaire
      if (!course.modules && !course.quizzes) {
        loadCourseContent(courseId)
      } else {
        setExpandedCourses(prev => new Set(prev).add(courseId))
      }
    }
  }

  const selectedCourse = useMemo(() => {
    return selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null
  }, [selectedCourseId, courses])

  const loadCourseModules = async (courseId: number) => {
    try {
      const modulesResponse = await moduleService.getModulesByCourse(courseId)
      let modules = []
      if (modulesResponse?.data) {
        modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : []
      } else if (Array.isArray(modulesResponse)) {
        modules = modulesResponse
      }
      setModulesByCourse(prev => new Map(prev).set(courseId, modules))
    } catch (err) {
      console.error("Error loading modules:", err)
    }
  }

  const handleAddModule = async (data: ModuleFormData) => {
    try {
      const selectedCourse = courses.find(c => c.id === data.courseId)
      const courseLevel = selectedCourse?.level || "DEBUTANT"
      
      const payload = {
        courseId: data.courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: [
          {
            title: data.title,
            description: data.description || "",
            moduleOrder: data.moduleOrder,
            lessons: data.lessons.map(lesson => {
              const { contentFile, quizId, ...lessonPayload } = lesson
              return {
                title: lessonPayload.title,
                lessonOrder: lessonPayload.lessonOrder,
                type: lessonPayload.type,
                ...(lessonPayload.contentUrl && lessonPayload.contentUrl.trim() && { contentUrl: lessonPayload.contentUrl }),
                ...(lessonPayload.duration && lessonPayload.duration > 0 && { duration: lessonPayload.duration }),
              }
            }),
          },
        ],
      }
      
      const response = await moduleService.saveModules(payload)
      
      toast({
        title: "Succès",
        description: response.message || "Le module a été créé avec succès.",
      })
      
      await loadCourseContent(data.courseId)
      addModuleModal.close()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le module.",
        variant: "destructive",
      })
    }
  }

  const handleEditModule = async (data: ModuleFormData) => {
    if (!editModuleModal.selectedItem) return
    
    try {
      const { module, courseId } = editModuleModal.selectedItem
      const selectedCourse = courses.find(c => c.id === courseId)
      const courseLevel = selectedCourse?.level || "DEBUTANT"
      
      const currentModules = courses.find(c => c.id === courseId)?.modules || []
      const updatedModules = currentModules.map(m => 
        m.id === module.id 
          ? {
              ...m,
              title: data.title,
              description: data.description || "",
              moduleOrder: data.moduleOrder,
              lessons: data.lessons.map(lesson => {
                const { contentFile, quizId, ...lessonPayload } = lesson
                return {
                  id: lessonPayload.id,
                  title: lessonPayload.title,
                  lessonOrder: lessonPayload.lessonOrder,
                  type: lessonPayload.type,
                  ...(lessonPayload.contentUrl && lessonPayload.contentUrl.trim() && { contentUrl: lessonPayload.contentUrl }),
                  ...(lessonPayload.duration && lessonPayload.duration > 0 && { duration: lessonPayload.duration }),
                }
              }),
            }
          : m
      )
      
      const payload = {
        courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: updatedModules,
      }
      
      const response = await moduleService.saveModules(payload)
      
      toast({
        title: "Succès",
        description: response.message || "Le module a été modifié avec succès.",
      })
      
      await loadCourseContent(courseId)
      editModuleModal.close()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de modifier le module.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteModule = async () => {
    if (!deleteModuleModal.selectedItem) return
    
    try {
      const { moduleId, courseId } = deleteModuleModal.selectedItem
      const selectedCourse = courses.find(c => c.id === courseId)
      const courseLevel = selectedCourse?.level || "DEBUTANT"
      
      const currentModules = courses.find(c => c.id === courseId)?.modules || []
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
        }))
      
      const payload = {
        courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: updatedModules,
      }
      
      const response = await moduleService.saveModules(payload)
      
      toast({
        title: "Succès",
        description: response.message || "Le module a été supprimé avec succès.",
      })
      
      await loadCourseContent(courseId)
      deleteModuleModal.close()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer le module.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLesson = async () => {
    if (!deleteLessonModal.selectedItem) return
    
    try {
      const { lessonId, moduleId, courseId } = deleteLessonModal.selectedItem
      const selectedCourse = courses.find(c => c.id === courseId)
      const courseLevel = selectedCourse?.level || "DEBUTANT"
      
      const currentModules = courses.find(c => c.id === courseId)?.modules || []
      const updatedModules = currentModules.map(m => 
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons?.filter(l => l.id !== lessonId) || [],
            }
          : m
      )
      
      const payload = {
        courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: updatedModules,
      }
      
      const response = await moduleService.saveModules(payload)
      
      toast({
        title: "Succès",
        description: response.message || "La leçon a été supprimée avec succès.",
      })
      
      await loadCourseContent(courseId)
      deleteLessonModal.close()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer la leçon.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuiz = async () => {
    if (!deleteQuizModal.selectedItem) return
    
    try {
      const { quizId, courseId } = deleteQuizModal.selectedItem
      await quizService.deleteQuiz(quizId)
      
      toast({
        title: "Succès",
        description: "Le quiz a été supprimé avec succès.",
      })
      
      await loadCourseContent(courseId)
      deleteQuizModal.close()
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer le quiz.",
        variant: "destructive",
      })
    }
  }

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

  const lessonTypeLabels = {
    VIDEO: t('content.lesson_types.video'),
    DOCUMENT: t('content.lesson_types.document'),
    QUIZ: t('content.lesson_types.quiz'),
    LAB: t('content.lesson_types.lab'),
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('content.title')}
        description={t('content.description')}
        action={{
          label: "Ajouter un module",
          onClick: () => {
            const courseToUse = selectedCourseId 
              ? courses.find(c => c.id === selectedCourseId)
              : courses[0]
            if (courseToUse) {
              addModuleModal.open({ courseId: courseToUse.id })
            } else {
              toast({
                title: "Erreur",
                description: "Veuillez sélectionner un cours d'abord.",
                variant: "destructive",
              })
            }
          },
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('content.courses.title')}</CardTitle>
              <CardDescription>
                {courses.length === 1 
                  ? t('content.courses.available', { count: courses.length })
                  : t('content.courses.available_plural', { count: courses.length })}
              </CardDescription>
            </div>
            <Select
              value={selectedCourseId?.toString() || "all"}
              onValueChange={(value) => setSelectedCourseId(value === "all" ? null : Number(value))}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={t('content.courses.filter_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('content.courses.filter_all')}</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('content.courses.empty')}
            </div>
          ) : (
            <div className="space-y-4">
              {(selectedCourseId 
                ? courses.filter(c => c.id === selectedCourseId)
                : courses
              ).map((course) => {
                const isExpanded = expandedCourses.has(course.id)
                const isLoading = loadingContent.has(course.id)
                const hasContent = course.modules || course.quizzes

                return (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCourse(course.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <ChevronRight 
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {course.subtitle || course.description?.substring(0, 100)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLoading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {course.modules && (
                            <Badge variant="secondary">
                              {course.modules.length === 1
                                ? t('content.modules.count', { count: course.modules.length })
                                : t('content.modules.count_plural', { count: course.modules.length })}
                            </Badge>
                          )}
                          {course.quizzes && course.quizzes.length > 0 && (
                            <Badge variant="secondary">
                              {t('content.quizzes.count', { count: course.quizzes.length })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && hasContent && (
                      <CardContent className="pt-0">
                        <div className="space-y-6">
                          {/* Modules et Leçons */}
                          {course.modules && course.modules.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {t('content.modules.title', { count: course.modules.length })}
                                <span className="text-xs text-muted-foreground font-normal ml-2">
                                  ({t('content.lessons.total', { count: course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) })})
                                </span>
                              </h3>
                              <Accordion type="multiple" className="space-y-2">
                                {course.modules
                                  .sort((a, b) => (a.moduleOrder || 0) - (b.moduleOrder || 0))
                                  .map((module) => (
                                    <AccordionItem 
                                      key={module.id} 
                                      value={`module-${module.id}`}
                                      className="border rounded-lg px-4"
                                    >
                                      <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2 flex-1 text-left">
                                          <span className="font-medium">{module.title}</span>
                                          {module.lessons && module.lessons.length > 0 && (
                                            <Badge variant="outline" className="ml-2">
                                              {module.lessons.length === 1
                                                ? t('content.lessons.count', { count: module.lessons.length })
                                                : t('content.lessons.count_plural', { count: module.lessons.length })}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                          <ActionMenu
                                            actions={[
                                              {
                                                label: "Modifier",
                                                icon: <Edit className="h-4 w-4" />,
                                                onClick: () => {
                                                  const moduleData: ModuleFormData = {
                                                    courseId: course.id,
                                                    title: module.title,
                                                    description: module.description || "",
                                                    moduleOrder: module.moduleOrder,
                                                    lessons: module.lessons?.map(l => ({
                                                      id: l.id,
                                                      title: l.title || "",
                                                      lessonOrder: l.lessonOrder || 1,
                                                      type: (l.type || "DOCUMENT") as "VIDEO" | "DOCUMENT" | "QUIZ" | "LAB",
                                                      contentUrl: l.contentUrl || "",
                                                      duration: l.duration || 0,
                                                    })) || [],
                                                  }
                                                  editModuleModal.open({ module, courseId: course.id })
                                                },
                                              },
                                              {
                                                label: "Supprimer",
                                                icon: <Trash2 className="h-4 w-4" />,
                                                onClick: () => deleteModuleModal.open({
                                                  moduleId: module.id,
                                                  courseId: course.id,
                                                }),
                                                variant: "destructive",
                                              },
                                            ]}
                                          />
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {module.lessons && module.lessons.length > 0 ? (
                                          <div className="space-y-2 pt-2">
                                            {module.lessons
                                              .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0))
                                              .map((lesson) => {
                                                const lessonType = (lesson.type || "DOCUMENT") as keyof typeof lessonTypeIcons
                                                const Icon = lessonTypeIcons[lessonType] || FileText
                                                const typeColor = lessonTypeColors[lessonType] || lessonTypeColors.DOCUMENT
                                                const typeLabel = lessonTypeLabels[lessonType] || "Document"
                                                
                                                return (
                                                  <div
                                                    key={lesson.id}
                                                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                                                  >
                                                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                          {lesson.title || t('content.lessons.no_title')}
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
                                                          {t('content.lessons.duration', { minutes: lesson.duration })}
                                                        </p>
                                                      )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      {lesson.contentUrl && (
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => {
                                                            contentViewerModal.open({
                                                              contentUrl: lesson.contentUrl || "",
                                                              title: lesson.title || "",
                                                              type: lesson.type || "DOCUMENT",
                                                            })
                                                          }}
                                                        >
                                                          <PlayCircle className="h-4 w-4 mr-1" />
                                                          {t('common.open')}
                                                        </Button>
                                                      )}
                                                      <ActionMenu
                                                        actions={[
                                                          {
                                                            label: "Supprimer",
                                                            icon: <Trash2 className="h-4 w-4" />,
                                                            onClick: () => deleteLessonModal.open({
                                                              lessonId: lesson.id!,
                                                              moduleId: module.id,
                                                              courseId: course.id,
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
                                        ) : (
                                          <p className="text-sm text-muted-foreground py-2">
                                            {t('content.lessons.empty_module')}
                                          </p>
                                        )}
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                              </Accordion>
                            </div>
                          )}

                          {/* Quiz */}
                          {course.quizzes && course.quizzes.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FileQuestion className="h-4 w-4" />
                                {t('content.quizzes.title', { count: course.quizzes.length })}
                              </h3>
                              <div className="space-y-2">
                                {course.quizzes.map((quiz) => (
                                  <Card key={quiz.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileQuestion className="h-4 w-4 text-purple-500" />
                                          <span className="font-medium">{quiz.title || quiz.titre || t('content.quizzes.no_title')}</span>
                                        </div>
                                        {quiz.description && (
                                          <p className="text-sm text-muted-foreground mb-2">
                                            {quiz.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          {(quiz.durationMinutes || quiz.dureeMinutes) && (
                                            <span>{t('content.quizzes.duration', { minutes: quiz.durationMinutes || quiz.dureeMinutes })}</span>
                                          )}
                                          {quiz.scoreMinimum && (
                                            <span>{t('content.quizzes.min_score', { score: quiz.scoreMinimum })}</span>
                                          )}
                                        </div>
                                      </div>
                                      <ActionMenu
                                        actions={[
                                          {
                                            label: "Supprimer",
                                            icon: <Trash2 className="h-4 w-4" />,
                                            onClick: () => deleteQuizModal.open({
                                              quizId: quiz.id,
                                              courseId: course.id,
                                            }),
                                            variant: "destructive",
                                          },
                                        ]}
                                      />
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {(!course.modules || course.modules.length === 0) && 
                           (!course.quizzes || course.quizzes.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                              {t('content.empty')}
                            </div>
                          )}
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

      {/* Modals */}
      {addModuleModal.selectedItem && (
        <ModuleLessonFormModal
          open={addModuleModal.isOpen}
          onOpenChange={addModuleModal.close}
          title="Ajouter un module"
          description="Créez un nouveau module avec ses leçons."
          onSubmit={handleAddModule}
          submitLabel="Créer le module"
          courses={courses}
          defaultValues={{
            courseId: addModuleModal.selectedItem.courseId,
            title: "",
            description: "",
            moduleOrder: (courses.find(c => c.id === addModuleModal.selectedItem.courseId)?.modules?.length || 0) + 1,
            lessons: [],
          }}
        />
      )}

      {editModuleModal.selectedItem && (
        <ModuleLessonFormModal
          open={editModuleModal.isOpen}
          onOpenChange={editModuleModal.close}
          title="Modifier le module"
          description="Modifiez le module et ses leçons."
          onSubmit={handleEditModule}
          submitLabel="Modifier le module"
          courses={courses}
          defaultValues={{
            courseId: editModuleModal.selectedItem.courseId,
            title: editModuleModal.selectedItem.module.title,
            description: editModuleModal.selectedItem.module.description || "",
            moduleOrder: editModuleModal.selectedItem.module.moduleOrder,
            lessons: editModuleModal.selectedItem.module.lessons?.map(l => ({
              id: l.id,
              title: l.title || "",
              lessonOrder: l.lessonOrder || 1,
              type: (l.type || "DOCUMENT") as "VIDEO" | "DOCUMENT" | "QUIZ" | "LAB",
              contentUrl: l.contentUrl || "",
              duration: l.duration || 0,
            })) || [],
          }}
        />
      )}

      <ConfirmDialog
        open={deleteModuleModal.isOpen}
        onOpenChange={deleteModuleModal.close}
        title="Supprimer le module"
        description="Êtes-vous sûr de vouloir supprimer ce module ? Toutes les leçons associées seront également supprimées. Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDeleteModule}
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteLessonModal.isOpen}
        onOpenChange={deleteLessonModal.close}
        title="Supprimer la leçon"
        description="Êtes-vous sûr de vouloir supprimer cette leçon ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDeleteLesson}
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteQuizModal.isOpen}
        onOpenChange={deleteQuizModal.close}
        title="Supprimer le quiz"
        description="Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDeleteQuiz}
        variant="destructive"
      />

      {contentViewerModal.selectedItem && (
        <ContentViewer
          open={contentViewerModal.isOpen}
          onOpenChange={contentViewerModal.close}
          contentUrl={contentViewerModal.selectedItem.contentUrl}
          title={contentViewerModal.selectedItem.title}
          type={contentViewerModal.selectedItem.type}
        />
      )}
    </div>
  )
}
