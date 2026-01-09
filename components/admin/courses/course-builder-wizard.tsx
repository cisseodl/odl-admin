"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronRight, ChevronLeft, Save, X } from "lucide-react"
import { Step1BasicInfo } from "./steps/step1-basic-info"
import { Step2Curriculum } from "./steps/step2-curriculum"
import { Step3LandingPage } from "./steps/step3-landing-page"
import { Step4Settings } from "./steps/step4-settings"
import { Step5Publish } from "./steps/step5-publish"
import type {
  CourseBuilderFormData,
  CourseStructureFormData,
  Step1BasicInfoData,
  Step2CurriculumData,
  Step3LandingPageData,
  Step4SettingsData,
  Step5PublishData,
} from "@/lib/validations/course-builder"
import {
  step1BasicInfoSchema,
  step2CurriculumSchema,
  step3LandingPageSchema,
  step4SettingsSchema,
  step5PublishSchema,
} from "@/lib/validations/course-builder"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { categorieService, instructorService } from "@/services"; // Import services
import { Categorie } from "@/models";
import { Instructor } from "@/services/instructor.service"; // Adjust if Instructor model is elsewhere

type Step = "basic-info" | "curriculum" | "landing-page" | "settings" | "publish"

type CourseBuilderWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: CourseBuilderFormData) => void
  defaultValues?: Partial<CourseBuilderFormData>
}

const STEPS: { id: Step; label: string; description: string }[] = [
  { id: "basic-info", label: "Informations de base", description: "Titre, catégorie, instructeur" },
  { id: "curriculum", label: "Curriculum", description: "Modules et chapitres" },
  { id: "landing-page", label: "Page d'accueil", description: "Description et médias" },
  { id: "settings", label: "Paramètres", description: "Options et permissions" },
  { id: "publish", label: "Publication", description: "Révision et publication" },
]

export function CourseBuilderWizard({ open, onOpenChange, onComplete, defaultValues }: CourseBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("basic-info")
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "error">("saved")
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch categories and instructors on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const categoriesResponse = await categorieService.getAllCategories();
        if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        }

        const instructorsResponse = await instructorService.getAllInstructors();
        if (instructorsResponse && Array.isArray(instructorsResponse.data)) {
          setInstructors(instructorsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories or instructors:", error);
        // Optionally show a toast error here
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Form pour chaque étape
  const step1Form = useForm<Step1BasicInfoData>({
    resolver: zodResolver(step1BasicInfoSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      subtitle: defaultValues?.subtitle,
      description: defaultValues?.description || "",
      category: defaultValues?.category ? String(defaultValues.category) : "", // Ensure it's a string for select value
      instructor: defaultValues?.instructor ? String(defaultValues.instructor) : "", // Ensure it's a string for select value
      language: defaultValues?.language || "Français",
      level: defaultValues?.level || "Tous niveaux",
    },
  })

  const step2Form = useForm<{ structure: CourseStructureFormData }>({
    resolver: zodResolver(step2CurriculumSchema),
    defaultValues: {
      structure: defaultValues?.structure || {
        id: `structure-${Date.now()}`,
        modules: [],
        totalDuration: "0h 0min",
        totalLessons: 0,
        totalContentItems: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  })

  const step3Form = useForm<Step3LandingPageData>({
    resolver: zodResolver(step3LandingPageSchema),
    defaultValues: {
      learningObjectives: defaultValues?.learningObjectives || [],
      prerequisites: defaultValues?.prerequisites || [],
      targetAudience: defaultValues?.targetAudience || [],
      thumbnail: defaultValues?.thumbnail,
      promotionalVideo: defaultValues?.promotionalVideo,
    },
  })

  const step4Form = useForm<Step4SettingsData>({
    resolver: zodResolver(step4SettingsSchema),
    defaultValues: {
      status: defaultValues?.status || "Brouillon",
      allowComments: defaultValues?.allowComments ?? true,
      allowDownloads: defaultValues?.allowDownloads ?? true,
      certificateEnabled: defaultValues?.certificateEnabled ?? false,
    },
  })

  const step5Form = useForm<Step5PublishData>({
    resolver: zodResolver(step5PublishSchema),
    defaultValues: {
      publishDate: defaultValues?.publishDate,
      publishTime: defaultValues?.publishTime,
    },
  })

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    if (!open) return

    const interval = setInterval(() => {
      handleAutoSave()
    }, 30000)

    return () => clearInterval(interval)
  }, [open, currentStep])

  const handleAutoSave = async () => {
    setIsSaving(true)
    setAutoSaveStatus("saving")
    try {
      // Simuler la sauvegarde
      await new Promise((resolve) => setTimeout(resolve, 500))
      const allData = getAllFormData()
      localStorage.setItem("course-builder-draft", JSON.stringify(allData))
      setAutoSaveStatus("saved")
    } catch {
      setAutoSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  const getAllFormData = (): Partial<CourseBuilderFormData> => {
    return {
      ...step1Form.getValues(),
      ...step2Form.getValues(),
      ...step3Form.getValues(),
      ...step4Form.getValues(),
      ...step5Form.getValues(),
    }
  }

  const getCurrentStepIndex = () => STEPS.findIndex((s) => s.id === currentStep)

  const canGoNext = async (): Promise<boolean> => {
    switch (currentStep) {
      case "basic-info":
        return step1Form.trigger().then((isValid) => isValid)
      case "curriculum":
        return step2Form.trigger().then((isValid) => isValid)
      case "landing-page":
        return step3Form.trigger().then((isValid) => isValid)
      case "settings":
        return step4Form.trigger().then((isValid) => isValid)
      case "publish":
        return step5Form.trigger().then((isValid) => isValid)
      default:
        return false
    }
  }

  const handleNext = async () => {
    const isValid = await canGoNext()
    if (!isValid) return

    setCompletedSteps((prev) => new Set([...prev, currentStep]))
    await handleAutoSave()

    const currentIndex = getCurrentStepIndex()
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id)
    }
  }

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id)
    }
  }

  const handleSubmit = async () => {
    const isValid = await canGoNext()
    if (!isValid) return

    const allData = getAllFormData()
    onComplete(allData as CourseBuilderFormData)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setCurrentStep("basic-info")
    setCompletedSteps(new Set())
    step1Form.reset()
    step2Form.reset()
    step3Form.reset()
    step4Form.reset()
    step5Form.reset()
    localStorage.removeItem("course-builder-draft")
  }

  const handleClose = () => {
    handleAutoSave()
    onOpenChange(false)
  }

  const progress = ((getCurrentStepIndex() + 1) / STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Créer une formation</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {STEPS[getCurrentStepIndex()].description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {autoSaveStatus === "saving" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Save className="h-3 w-3 animate-spin" />
                  Sauvegarde...
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Sauvegardé
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-muted-foreground">
              Étape {getCurrentStepIndex() + 1} sur {STEPS.length}
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
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
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
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-2 text-center hidden lg:block max-w-[100px]">
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
          {currentStep === "basic-info" && <Step1BasicInfo form={step1Form} categories={categories} instructors={instructors} loading={loadingData} />}
          {currentStep === "curriculum" && <Step2Curriculum form={step2Form} />}
          {currentStep === "landing-page" && <Step3LandingPage form={step3Form} />}
          {currentStep === "settings" && <Step4Settings form={step4Form} />}
          {currentStep === "publish" && <Step5Publish form={step5Form} allData={getAllFormData()} />}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button variant="outline" onClick={getCurrentStepIndex() === 0 ? handleClose : handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {getCurrentStepIndex() === 0 ? "Annuler" : "Précédent"}
          </Button>
          <div className="flex items-center gap-2">
            {getCurrentStepIndex() < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Check className="h-4 w-4 mr-2" />
                Publier la formation
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

