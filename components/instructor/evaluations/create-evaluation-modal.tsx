"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"
import { Save, Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { EvaluationType } from "@/models/evaluation.model"
import { courseService } from "@/services"
import { Course } from "@/models"
import { fileUploadService } from "@/services/file-upload.service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const createEvaluationSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis." }),
  description: z.string().optional(),
  courseId: z.number().min(1, { message: "Le cours est requis." }),
  type: z.nativeEnum(EvaluationType, {
    required_error: "Le type d'évaluation est requis.",
  }),
  tpInstructions: z.string().optional(),
  tpFileUrl: z.string().optional(),
})

type CreateEvaluationFormData = z.infer<typeof createEvaluationSchema>

type CreateEvaluationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateEvaluationFormData & { tpFile?: File }) => Promise<void>
}

export function CreateEvaluationModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateEvaluationModalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const form = useForm<CreateEvaluationFormData>({
    resolver: zodResolver(createEvaluationSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: 0,
      type: EvaluationType.QUIZ,
      tpInstructions: "",
      tpFileUrl: "",
    },
  })

  const evaluationType = form.watch("type")

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) {
        console.warn("No user ID available for fetching courses")
        setCourses([])
        return
      }
      
      setLoadingCourses(true)
      try {
        // Récupérer uniquement les cours de l'instructeur connecté
        const coursesData = await courseService.getCoursesByInstructorId(Number(user.id))
        if (Array.isArray(coursesData) && coursesData.length > 0) {
          setCourses(coursesData)
        } else {
          console.warn("No courses found for instructor:", coursesData)
          setCourses([])
          toast({
            title: t('evaluations.toasts.error_load_courses') || "Avertissement",
            description: "Aucun cours disponible. Veuillez créer un cours d'abord.",
            variant: "default",
          })
        }
      } catch (err: any) {
        console.error("Error fetching courses:", err)
        setCourses([])
        toast({
          title: t('evaluations.toasts.error_load_courses') || "Erreur",
          description: err.message || "Impossible de charger les cours.",
          variant: "destructive",
        })
      } finally {
        setLoadingCourses(false)
      }
    }
    if (open && user?.id) {
      fetchCourses()
    }
  }, [open, user?.id, t, toast])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setUploadingFile(true)
    try {
      const fileUrl = await fileUploadService.uploadFile(file)
      form.setValue("tpFileUrl", fileUrl)
      toast({
        title: t('evaluations.toasts.success_file_upload') || "Succès",
        description: "Fichier téléchargé avec succès.",
      })
    } catch (err: any) {
      console.error("Error uploading file:", err)
      toast({
        title: t('evaluations.toasts.error_file_upload') || "Erreur",
        description: err.message || "Impossible de télécharger le fichier.",
        variant: "destructive",
      })
      setSelectedFile(null)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (data: CreateEvaluationFormData) => {
    await onSubmit({ ...data, tpFile: selectedFile || undefined })
    form.reset()
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('evaluations.create.title') || "Créer une évaluation"}</DialogTitle>
          <DialogDescription>
            {t('evaluations.create.description') || "Créez une nouvelle évaluation pour vos cours"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('evaluations.create.form.title') || "Titre"}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('evaluations.create.form.title_placeholder') || "Titre de l'évaluation"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('evaluations.create.form.description') || "Description"}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('evaluations.create.form.description_placeholder') || "Description de l'évaluation"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('evaluations.create.form.course') || "Cours"}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                    disabled={loadingCourses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('evaluations.create.form.course_placeholder') || "Sélectionner un cours"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title || `Cours #${course.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('evaluations.create.form.type') || "Type d'évaluation"}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as EvaluationType)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('evaluations.create.form.type_placeholder') || "Sélectionner un type"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EvaluationType.QUIZ}>
                        {t('evaluations.create.form.type_quiz') || "Quiz (Auto-corrigé)"}
                      </SelectItem>
                      <SelectItem value={EvaluationType.TP}>
                        {t('evaluations.create.form.type_tp') || "TP (Corrigé par instructeur)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {evaluationType === EvaluationType.TP && (
              <>
                <FormField
                  control={form.control}
                  name="tpInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('evaluations.create.form.tp_instructions') || "Instructions du TP"}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('evaluations.create.form.tp_instructions_placeholder') || "Instructions pour le travail pratique..."}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label htmlFor="tpFile">{t('evaluations.create.form.tp_file') || "Fichier TP (optionnel)"}</Label>
                  <Input
                    id="tpFile"
                    type="file"
                    onChange={handleFileChange}
                    disabled={uploadingFile}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      {t('evaluations.create.form.file_selected') || "Fichier sélectionné"}: {selectedFile.name}
                    </p>
                  )}
                  {uploadingFile && (
                    <p className="text-sm text-muted-foreground">
                      {t('evaluations.create.form.uploading') || "Téléchargement en cours..."}
                    </p>
                  )}
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="submit" disabled={uploadingFile}>
                <Save className="h-4 w-4 mr-2" />
                {t('evaluations.create.submit') || "Créer l'évaluation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
