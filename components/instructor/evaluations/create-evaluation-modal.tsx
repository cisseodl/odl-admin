"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { z } from "zod"
import { Save, Upload, PlusCircle, MinusCircle, CheckCircle2, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { EvaluationType } from "@/models/evaluation.model"
import { courseService } from "@/services"
import { Course } from "@/models"
import { fileUploadService } from "@/services/file-upload.service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const responseSchema = z.object({
  title: z.string().min(1, "Le texte de la réponse est requis."),
  description: z.string().optional(),
  isCorrect: z.boolean().default(false),
})

const questionSchema = z.object({
  title: z.string().min(1, "Le titre de la question est requis."),
  description: z.string().optional(),
  type: z.string().default("SINGLE_CHOICE"),
  points: z.number().min(1, "Les points doivent être au moins 1.").default(1),
  reponses: z.array(responseSchema).min(2, "Au moins deux réponses sont requises."),
})

const createEvaluationSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis." }),
  description: z.string().optional(),
  courseId: z.number().min(1, { message: "Le cours est requis." }),
  type: z.nativeEnum(EvaluationType, {
    required_error: "Le type d'évaluation est requis.",
  }),
  tpInstructions: z.string().optional(),
  tpFileUrl: z.string().optional(),
  questions: z.array(questionSchema).optional(),
})

type CreateEvaluationFormData = z.infer<typeof createEvaluationSchema>

type CreateEvaluationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateEvaluationFormData & { tpFile?: File; questions?: any[] }) => Promise<void>
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
      questions: [],
    },
  })

  const evaluationType = form.watch("type")
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  })

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
    // Pour les QUIZ, s'assurer que les questions sont incluses
    const submitData = {
      ...data,
      tpFile: selectedFile || undefined,
      questions: evaluationType === EvaluationType.QUIZ ? data.questions : undefined,
    }
    await onSubmit(submitData)
    form.reset({
      title: "",
      description: "",
      courseId: 0,
      type: EvaluationType.QUIZ,
      tpInstructions: "",
      tpFileUrl: "",
      questions: [],
    })
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
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

            {evaluationType === EvaluationType.QUIZ && (
              <div className="space-y-6 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('evaluations.create.form.questions_title') || "Questions du quiz"}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendQuestion({
                      title: "",
                      description: "",
                      type: "SINGLE_CHOICE",
                      points: 1,
                      reponses: [{ title: "", isCorrect: false }, { title: "", isCorrect: false }],
                    })}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t('evaluations.create.form.add_question') || "Ajouter une question"}
                  </Button>
                </div>

                {questionFields.map((question, qIndex) => (
                  <div key={question.id} className="space-y-4 border p-4 rounded-md relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-md font-medium">
                        {t('evaluations.create.form.question_number', { number: qIndex + 1 }) || `Question #${qIndex + 1}`}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${qIndex}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('evaluations.create.form.question_title') || "Titre de la question"}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('evaluations.create.form.question_title_placeholder') || "Quelle est la capitale de la France ?"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`questions.${qIndex}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('evaluations.create.form.question_type') || "Type"}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "SINGLE_CHOICE"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SINGLE_CHOICE">{t('evaluations.create.form.type_single') || "Choix unique"}</SelectItem>
                                <SelectItem value="MULTIPLE_CHOICE">{t('evaluations.create.form.type_multiple') || "Choix multiples"}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questions.${qIndex}.points`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('evaluations.create.form.points') || "Points"}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="10"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                value={field.value || 1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2 pl-4 border-l-2">
                      <h5 className="text-base font-medium">{t('evaluations.create.form.responses_title') || "Réponses"}</h5>
                      <QuestionResponseFields qIndex={qIndex} control={form.control} watch={form.watch} />
                    </div>
                  </div>
                ))}

                {questionFields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('evaluations.create.form.no_questions') || "Aucune question ajoutée. Cliquez sur 'Ajouter une question' pour commencer."}
                  </p>
                )}
              </div>
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

// Helper component for managing responses within a question
function QuestionResponseFields({ qIndex, control, watch }: { qIndex: number; control: any; watch: any }) {
  const { t } = useLanguage()
  const { fields: responseFields, append: appendResponse, remove: removeResponse } = useFieldArray({
    control,
    name: `questions.${qIndex}.reponses`,
  })

  return (
    <div className="space-y-2">
      {responseFields.map((response, rIndex) => {
        const isCorrect = watch(`questions.${qIndex}.reponses.${rIndex}.isCorrect`) || false
        return (
          <div
            key={response.id}
            className={`flex items-center space-x-2 p-3 rounded-md border-2 transition-colors ${
              isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-300 bg-red-50 dark:bg-red-950"
            }`}
          >
            <FormField
              control={control}
              name={`questions.${qIndex}.reponses.${rIndex}.isCorrect`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <div className="flex items-center gap-2">
                      {field.value ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="ml-2"
                      />
                    </div>
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      <Badge variant={field.value ? "default" : "destructive"} className="ml-2">
                        {field.value
                          ? t('evaluations.create.form.correct_answer') || "Bonne réponse"
                          : t('evaluations.create.form.wrong_answer') || "Mauvaise réponse"}
                      </Badge>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`questions.${qIndex}.reponses.${rIndex}.title`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input
                      placeholder={
                        isCorrect
                          ? t('evaluations.create.form.response_correct_placeholder') || "Texte de la bonne réponse"
                          : t('evaluations.create.form.response_wrong_placeholder') || "Texte de la mauvaise réponse"
                      }
                      {...field}
                      className={isCorrect ? "border-green-500" : "border-red-300"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeResponse(rIndex)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => appendResponse({ title: "", isCorrect: false })}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        {t('evaluations.create.form.add_response') || "Ajouter une réponse"}
      </Button>
    </div>
  )
}
