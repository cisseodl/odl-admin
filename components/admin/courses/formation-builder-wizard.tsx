"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronRight, ChevronLeft, X, BookOpen, Layers, FileText, HelpCircle } from "lucide-react"
import { StepCourse } from "./formation-steps/step-course"
import { StepModules } from "./formation-steps/step-modules"
import { StepLessons } from "./formation-steps/step-lessons"
import { StepQuiz } from "./formation-steps/step-quiz"
import { courseService, categorieService, instructorService, moduleService, quizService } from "@/services"
import { fileUploadService } from "@/services/file-upload.service"
import { useToast } from "@/hooks/use-toast"
import { Categorie } from "@/models"
import { ApiInstructor } from "@/services/instructor.service"

type Step = "course" | "modules" | "lessons" | "quiz"

type FormationBuilderWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: (courseId: number) => void
}

// STEPS sera défini dans le composant pour utiliser t()

// Types pour les données du wizard
export type CourseFormData = {
  title: string
  subtitle?: string
  description: string
  categoryId?: number
  formationId?: number
  instructorId: number
  level: string
  language: string
  imageFile?: File
  objectives: string[]
  features: string[]
}

export type ModuleFormData = {
  id?: string
  title: string
  description: string
  moduleOrder: number
}

export type LessonFormData = {
  id?: string
  moduleId: string
  title: string
  lessonOrder: number
  type: "VIDEO" | "QUIZ" | "DOCUMENT" | "LAB"
  contentUrl?: string
  duration: number
  file?: File // Fichier à uploader
}

export type QuizFormData = {
  id?: string
  title: string
  description: string
  durationMinutes: number
  scoreMinimum: number
  questions: Array<{
    id?: string
    content: string
    type: "QCM" | "TEXTE"
    points: number
    reponses: Array<{
      id?: string
      text: string
      isCorrect: boolean
    }>
  }>
}

type WizardData = {
  course?: CourseFormData & { courseId?: number }
  modules: ModuleFormData[] & { moduleIds?: number[] } // IDs des modules créés
  lessons: LessonFormData[]
  quiz?: QuizFormData
}

export function FormationBuilderWizard({ open, onOpenChange, onComplete }: FormationBuilderWizardProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<Step>("course")
  
  const STEPS: { id: Step; label: string; description: string; icon: React.ReactNode }[] = [
    { id: "course", label: t('wizard.steps.course.label'), description: t('wizard.steps.course.description'), icon: <BookOpen className="h-5 w-5" /> },
    { id: "modules", label: t('wizard.steps.modules.label'), description: t('wizard.steps.modules.description'), icon: <Layers className="h-5 w-5" /> },
    { id: "lessons", label: t('wizard.steps.lessons.label'), description: t('wizard.steps.lessons.description'), icon: <FileText className="h-5 w-5" /> },
    { id: "quiz", label: t('wizard.steps.quiz.label'), description: t('wizard.steps.quiz.description'), icon: <HelpCircle className="h-5 w-5" /> },
  ]
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Categorie[]>([])
  const [instructors, setInstructors] = useState<ApiInstructor[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Données du wizard
  const [wizardData, setWizardData] = useState<WizardData>({
    modules: [],
    lessons: [],
  })

  // Charger les données initiales
  useEffect(() => {
    if (!open) return
    
    const fetchData = async () => {
      setLoadingData(true)
      try {
        const [categoriesResponse, instructorsResponse] = await Promise.all([
          categorieService.getAllCategories(),
          instructorService.getAllInstructors(),
        ])
        
        // Le service retourne maintenant toujours un tableau (vide en cas d'erreur)
        if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse)
        } else if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data)
        } else {
          // Si categoriesResponse est null ou une structure inattendue, utiliser un tableau vide
          setCategories([])
          if (categoriesResponse !== null && categoriesResponse !== undefined) {
            console.warn("Unexpected categories response structure:", categoriesResponse)
          }
        }
        
        // Les instructors peuvent être dans response.data ou directement dans response
        if (instructorsResponse) {
          const instructorsData = Array.isArray(instructorsResponse.data) 
            ? instructorsResponse.data 
            : Array.isArray(instructorsResponse)
            ? instructorsResponse
            : []
          setInstructors(instructorsData)
          console.log("FormationBuilderWizard - Loaded instructors:", instructorsData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: t('common.error'),
          description: t('wizard.errors.load_data_failed'),
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchData()
  }, [open, toast])

  const handleCourseSubmit = async (data: CourseFormData) => {
    setIsSaving(true)
    try {
      // Créer le cours (sans modules)
      // Utiliser formationId si disponible, sinon categoryId
      const categoryIdForEndpoint = data.categoryId || 0 // Le backend peut gérer les deux
      const coursePayload = {
        title: data.title,
        subtitle: data.subtitle || "",
        description: data.description,
        instructorId: data.instructorId,
        categoryId: data.formationId ? undefined : data.categoryId, // Ne pas envoyer categoryId si formationId est présent
        formationId: data.formationId || undefined,
        level: data.level || "DEBUTANT",
        language: data.language || "Français",
        objectives: data.objectives || [],
        features: data.features || [],
        modules: [], // Pas de modules pour l'instant
      }

      const createdCourse = await courseService.createCourse(
        categoryIdForEndpoint || data.categoryId || 0, // Utiliser categoryId pour l'endpoint (compatibilité)
        coursePayload,
        data.imageFile
      )

      // Le backend retourne CResponse<CourseDto> avec structure { ok, data: CourseDto, message }
      // CourseDto a un champ 'id'
      let courseId: number | null = null;
      if (createdCourse && typeof createdCourse === 'object') {
        if ('id' in createdCourse && typeof createdCourse.id === 'number') {
          courseId = createdCourse.id;
        } else if ('data' in createdCourse && createdCourse.data && typeof createdCourse.data === 'object' && 'id' in createdCourse.data) {
          courseId = createdCourse.data.id as number;
        }
      }

      if (!courseId) {
        console.error("Course creation response:", createdCourse);
        throw new Error("Impossible de récupérer l'ID du cours créé. Réponse: " + JSON.stringify(createdCourse));
      }

      setWizardData(prev => ({ ...prev, course: { ...data, courseId } }))
      setCompletedSteps(prev => new Set([...prev, "course"]))
      setCurrentStep("modules")
      
      toast({
        title: "Succès",
        description: "La formation a été créée. Vous pouvez maintenant ajouter les modules.",
      })
    } catch (error: any) {
      console.error("Error creating course:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la formation.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleModulesSubmit = async (modules: ModuleFormData[]) => {
    if (!wizardData.course?.courseId) {
      toast({
        title: "Erreur",
        description: "Le cours doit être créé avant d'ajouter des modules.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Créer les modules (sans leçons pour l'instant)
      const modulesPayload = {
        courseId: wizardData.course.courseId,
        courseType: (wizardData.course.level || "DEBUTANT").toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
                  modules: modules.map((m, idx) => ({
                    title: m.title,
                    description: m.description || undefined, // Changed to undefined
                    moduleOrder: m.moduleOrder || idx + 1,
                    lessons: [], // Pas de leçons pour l'instant
                  })),      }

      await moduleService.saveModules(modulesPayload)

      setWizardData(prev => ({ ...prev, modules }))
      setCompletedSteps(prev => new Set([...prev, "modules"]))
      setCurrentStep("lessons")
      
      toast({
        title: "Succès",
        description: "Les modules ont été créés. Vous pouvez maintenant ajouter les leçons.",
      })
    } catch (error: any) {
      console.error("Error creating modules:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer les modules.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLessonsSubmit = async (lessons: LessonFormData[]) => {
    if (!wizardData.course?.courseId || wizardData.modules.length === 0) {
      toast({
        title: "Erreur",
        description: "Le cours et les modules doivent être créés avant d'ajouter des leçons.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Uploader les fichiers des leçons si nécessaire
      const lessonsWithFiles = await Promise.all(
        lessons.map(async (lesson) => {
          let contentUrl = lesson.contentUrl || "";
          let finalType = lesson.type; // Type final de la leçon
          
          if (lesson.file) {
            try {
              // Détecter le type de fichier réel pour déterminer le dossier ET le type de leçon
              const fileType = lesson.file.type || "";
              const fileName = lesson.file.name.toLowerCase();
              let folderName = "lessons"; // Dossier par défaut
              
              // Détecter automatiquement le type de leçon basé sur le fichier
              if (fileType.startsWith("video/") || fileName.endsWith(".mp4") || fileName.endsWith(".avi") || fileName.endsWith(".mov") || fileName.endsWith(".mkv")) {
                folderName = "videos";
                finalType = "VIDEO"; // Forcer le type à VIDEO si c'est une vidéo
              } else if (
                fileType === "application/pdf" || 
                fileType === "application/msword" ||
                fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                fileType === "application/vnd.ms-powerpoint" ||
                fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
                fileType === "text/plain" ||
                fileName.endsWith(".pdf") ||
                fileName.endsWith(".doc") ||
                fileName.endsWith(".docx") ||
                fileName.endsWith(".txt") ||
                fileName.endsWith(".ppt") ||
                fileName.endsWith(".pptx")
              ) {
                folderName = "documents";
                finalType = "DOCUMENT"; // Forcer le type à DOCUMENT si c'est un document
              } else if (lesson.type === "LAB") {
                folderName = "labs";
                finalType = "LAB";
              }
              
              console.log(`Uploading file for lesson "${lesson.title}": type=${finalType}, folder=${folderName}, fileType=${fileType}`);
              contentUrl = await fileUploadService.uploadFile(lesson.file, folderName);
            } catch (error) {
              console.error(`Error uploading file for lesson ${lesson.title}:`, error);
              throw new Error(`Erreur lors de l'upload du fichier pour la leçon "${lesson.title}"`);
            }
          }
          
          return {
            ...lesson,
            type: finalType, // Utiliser le type détecté automatiquement
            contentUrl,
          };
        })
      );

      // Récupérer les modules créés pour obtenir leurs IDs
      const modulesResponse = await moduleService.getModulesByCourse(wizardData.course.courseId);
      const createdModules = Array.isArray(modulesResponse?.data) ? modulesResponse.data : (Array.isArray(modulesResponse) ? modulesResponse : []);
      
      // Mapper les modules par leur titre pour associer les leçons
      const moduleMap = new Map<string, number>();
      createdModules.forEach((m: any) => {
        moduleMap.set(m.title, m.id);
      });

      // Créer les modules avec leurs leçons
      const modulesWithLessons = wizardData.modules.map((m, idx) => {
        const moduleId = moduleMap.get(m.title);
        const moduleLessons = lessonsWithFiles
          .filter(l => l.moduleId === m.id)
          .map((l, lidx) => {
            // Conforme au DTO LessonCreationRequest du backend
            const lesson: any = {
              title: l.title, // @NotBlank - requis
              lessonOrder: l.lessonOrder || lidx + 1, // @NotNull - requis
              type: l.type, // @NotNull - requis (VIDEO, QUIZ, DOCUMENT, LAB)
            };
            
            // contentUrl est optionnel dans le DTO
            if (l.contentUrl && l.contentUrl.trim() !== "") {
              lesson.contentUrl = l.contentUrl;
            }
            
            // duration est optionnel dans le DTO (en minutes)
            if (l.duration && l.duration > 0) {
              lesson.duration = l.duration; // Durée en minutes conforme au DTO
            }
            
            return lesson;
          });

        // Conforme au DTO ModuleCreationRequest du backend
        return {
          id: moduleId, // ID du module existant (pour update)
          title: m.title, // @NotBlank - requis
          description: m.description || undefined, // Changed to undefined
          moduleOrder: m.moduleOrder || idx + 1, // @NotNull - requis
          lessons: moduleLessons, // List<LessonCreationRequest>
        };
      });

      const modulesPayload = {
        courseId: wizardData.course.courseId,
        courseType: (wizardData.course.level || "DEBUTANT").toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: modulesWithLessons,
      };

      // Log pour déboguer
      console.log("Payload des modules avec leçons:", JSON.stringify(modulesPayload, null, 2));
      console.log("Nombre total de leçons:", modulesWithLessons.reduce((acc, m) => acc + (m.lessons?.length || 0), 0));

      const response = await moduleService.saveModules(modulesPayload);
      console.log("Réponse du backend après sauvegarde des modules:", response);

      setWizardData(prev => ({ ...prev, lessons }))
      setCompletedSteps(prev => new Set([...prev, "lessons"]))
      setCurrentStep("quiz")
      
      toast({
        title: "Succès",
        description: "Les leçons ont été ajoutées. Vous pouvez maintenant créer le quiz.",
      })
    } catch (error: any) {
      console.error("Error creating lessons:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter les leçons.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuizSubmit = async (quiz: QuizFormData) => {
    if (!wizardData.course?.courseId) {
      toast({
        title: "Erreur",
        description: "Le cours doit être créé avant d'ajouter un quiz.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Créer le quiz
      if (quiz) {
        await quizService.createQuiz({
          title: quiz.title,
          courseId: wizardData.course.courseId,
          durationMinutes: quiz.durationMinutes,
          scoreMinimum: quiz.scoreMinimum,
          questions: quiz.questions.map(q => ({
            content: q.content,
            type: q.type, // QCM or TEXTE as expected by backend
            points: q.points,
            reponses: q.reponses.map(r => ({
              text: r.text,
              isCorrect: r.isCorrect,
            })),
          })),
        })
      }

      toast({
        title: t('common.success'),
        description: t('wizard.success.course_created'),
      })

      onComplete?.(wizardData.course.courseId)
      handleReset()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating quiz:", error)
      toast({
        title: t('common.error'),
        description: error.message || t('wizard.errors.create_quiz_failed'),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }

  const handleBack = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id)
    }
  }

  const handleReset = () => {
    setCurrentStep("course")
    setCompletedSteps(new Set())
    setWizardData({ modules: [], lessons: [] })
  }

  const handleClose = () => {
    if (isSaving) return
    handleReset()
    onOpenChange(false)
  }

  const getCurrentStepIndex = () => STEPS.findIndex(s => s.id === currentStep)
  const progress = ((getCurrentStepIndex() + 1) / STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{t('wizard.title')}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {STEPS[getCurrentStepIndex()].description}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSaving}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('wizard.progress.label')}</span>
            <span className="text-sm text-muted-foreground">
              {t('wizard.progress.step_info', { current: getCurrentStepIndex() + 1, total: STEPS.length })}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(step.id)
              const isActive = currentStep === step.id
              const isPast = index < getCurrentStepIndex()

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                        isCompleted || isPast
                          ? "bg-primary text-primary-foreground border-primary"
                          : isActive
                            ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                            : "bg-muted border-muted-foreground/20"
                      }`}
                    >
                      {isCompleted || isPast ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center max-w-[120px]">
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        isPast ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6 min-h-[500px]">
          {currentStep === "course" && (
            <StepCourse
              onSubmit={handleCourseSubmit}
              categories={categories}
              instructors={instructors}
              loading={loadingData}
              defaultValues={wizardData.course}
            />
          )}
          {currentStep === "modules" && (
            <StepModules
              onSubmit={handleModulesSubmit}
              defaultModules={wizardData.modules}
              courseCreated={!!wizardData.course}
            />
          )}
          {currentStep === "lessons" && (
            <StepLessons
              onSubmit={handleLessonsSubmit}
              modules={wizardData.modules}
              defaultLessons={wizardData.lessons}
            />
          )}
          {currentStep === "quiz" && (
            <StepQuiz
              onSubmit={handleQuizSubmit}
              defaultQuiz={wizardData.quiz}
              onSkip={() => {
                // Si l'utilisateur saute le quiz, fermer le wizard
                onComplete?.(wizardData.course?.courseId || 0)
                handleReset()
                onOpenChange(false)
              }}
            />
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="outline"
            onClick={getCurrentStepIndex() === 0 ? handleClose : handleBack}
            disabled={isSaving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {getCurrentStepIndex() === 0 ? t('common.cancel') : t('wizard.buttons.previous')}
          </Button>
          {/* Les boutons "Suivant" sont gérés dans chaque étape via leur propre formulaire */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
