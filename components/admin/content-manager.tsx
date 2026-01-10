"use client"

import { useState, useEffect, useMemo } from "react"
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

const lessonTypeLabels = {
  VIDEO: "Vidéo",
  DOCUMENT: "Document",
  QUIZ: "Quiz",
  LAB: "Lab",
}

const lessonTypeColors = {
  VIDEO: "bg-blue-500/10 text-blue-500",
  DOCUMENT: "bg-green-500/10 text-green-500",
  QUIZ: "bg-purple-500/10 text-purple-500",
  LAB: "bg-orange-500/10 text-orange-500",
}

export function ContentManager() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<CourseWithContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())
  const [loadingContent, setLoadingContent] = useState<Set<number>>(new Set())

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
      setError(err.message || "Impossible de charger les formations.")
      toast({
        title: "Erreur",
        description: "Impossible de charger les formations.",
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
        title: "Erreur",
        description: `Impossible de charger le contenu de la formation.`,
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
    <div className="space-y-6">
      <PageHeader
        title="Gestion du Contenu"
        description="Consultez et gérez les modules, leçons et quiz de toutes les formations"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Formations</CardTitle>
              <CardDescription>
                {courses.length} formation{courses.length !== 1 ? "s" : ""} disponible{courses.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select
              value={selectedCourseId?.toString() || "all"}
              onValueChange={(value) => setSelectedCourseId(value === "all" ? null : Number(value))}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrer par formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les formations</SelectItem>
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
              Aucune formation disponible.
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
                              {course.modules.length} module{course.modules.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                          {course.quizzes && course.quizzes.length > 0 && (
                            <Badge variant="secondary">
                              {course.quizzes.length} quiz
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
                                Modules ({course.modules.length})
                                <span className="text-xs text-muted-foreground font-normal ml-2">
                                  ({course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} leçons au total)
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
                                              {module.lessons.length} leçon{module.lessons.length !== 1 ? "s" : ""}
                                            </Badge>
                                          )}
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
                                                          {lesson.title || "Leçon sans titre"}
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
                                                    {lesson.contentUrl && (
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(lesson.contentUrl || "", "_blank")}
                                                      >
                                                        <PlayCircle className="h-4 w-4 mr-1" />
                                                        Ouvrir
                                                      </Button>
                                                    )}
                                                  </div>
                                                )
                                              })}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground py-2">
                                            Aucune leçon dans ce module.
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
                                Quiz ({course.quizzes.length})
                              </h3>
                              <div className="space-y-2">
                                {course.quizzes.map((quiz) => (
                                  <Card key={quiz.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FileQuestion className="h-4 w-4 text-purple-500" />
                                          <span className="font-medium">{quiz.title || quiz.titre || "Quiz sans titre"}</span>
                                        </div>
                                        {quiz.description && (
                                          <p className="text-sm text-muted-foreground mb-2">
                                            {quiz.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          {(quiz.durationMinutes || quiz.dureeMinutes) && (
                                            <span>Durée: {quiz.durationMinutes || quiz.dureeMinutes} min</span>
                                          )}
                                          {quiz.scoreMinimum && (
                                            <span>Score minimum: {quiz.scoreMinimum}%</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {(!course.modules || course.modules.length === 0) && 
                           (!course.quizzes || course.quizzes.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground">
                              Aucun contenu disponible pour cette formation.
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
    </div>
  )
}
