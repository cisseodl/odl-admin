"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, MinusCircle, CheckCircle2, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { courseService, lessonService } from "@/services"
import { Course } from "@/models"
import { Lesson } from "@/models/lesson.model"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { z } from "zod"

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

const quizFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().optional(),
  courseId: z.number().min(1, "Le cours est requis."),
  lessonId: z.number().min(1, "La leçon est requise."),
  questions: z.array(questionSchema).min(1, "Au moins une question est requise."),
})

type QuizFormData = z.infer<typeof quizFormSchema>

type QuizFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<QuizFormData>
  onSubmit: (data: QuizFormData) => void
  submitLabel?: string
}

export function QuizFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: QuizFormModalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(defaultValues?.courseId || null)

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      courseId: defaultValues?.courseId || 0,
      lessonId: defaultValues?.lessonId || 0,
      questions: defaultValues?.questions || [],
    },
  })

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  // Charger les cours de l'instructeur
  useEffect(() => {
    if (open && user?.id) {
      const fetchCourses = async () => {
        setLoadingCourses(true)
        try {
          const coursesData = await courseService.getCoursesByInstructorId(Number(user.id))
          setCourses(Array.isArray(coursesData) ? coursesData : [])
        } catch (err: any) {
          console.error("Error fetching courses:", err)
          toast({
            title: "Erreur",
            description: "Impossible de charger les cours.",
            variant: "destructive",
          })
        } finally {
          setLoadingCourses(false)
        }
      }
      fetchCourses()
    }
  }, [open, user?.id, toast])

  // Charger les leçons quand un cours est sélectionné
  useEffect(() => {
    if (open && selectedCourseId) {
      const fetchLessons = async () => {
        setLoadingLessons(true)
        try {
          const lessonsData = await lessonService.getLessonsByCourse(selectedCourseId)
          setLessons(lessonsData)
        } catch (err: any) {
          console.error("Error fetching lessons:", err)
          toast({
            title: "Erreur",
            description: "Impossible de charger les leçons.",
            variant: "destructive",
          })
        } finally {
          setLoadingLessons(false)
        }
      }
      fetchLessons()
    } else {
      setLessons([])
    }
  }, [open, selectedCourseId, toast])

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (open && defaultValues) {
      setSelectedCourseId(defaultValues.courseId || null)
    } else if (open && !defaultValues) {
      setSelectedCourseId(null)
      setLessons([])
      form.reset({
        title: "",
        description: "",
        courseId: 0,
        lessonId: 0,
        questions: [],
      })
    }
  }, [open, defaultValues])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du quiz *</FormLabel>
                  <FormControl>
                    <Input placeholder="Quiz sur AWS" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Décrivez ce que ce quiz évalue..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sélecteur de cours */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cours *</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : "__none__"}
                    onValueChange={(value) => {
                      const courseId = value && value !== "__none__" ? Number(value) : null
                      field.onChange(courseId || 0)
                      setSelectedCourseId(courseId)
                      form.setValue("lessonId", 0, { shouldValidate: false })
                      setLessons([])
                    }}
                    disabled={loadingCourses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCourses ? "Chargement..." : "Sélectionner un cours"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__" disabled>Sélectionner un cours</SelectItem>
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

            {/* Sélecteur de leçon */}
            {selectedCourseId && (
              <FormField
                control={form.control}
                name="lessonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leçon associée *</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : "__none__"}
                      onValueChange={(value) => {
                        field.onChange(value && value !== "__none__" ? Number(value) : 0)
                      }}
                      disabled={loadingLessons}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingLessons ? "Chargement..." : "Sélectionner une leçon"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__" disabled>Sélectionner une leçon</SelectItem>
                        {lessons.map((lesson) => (
                          <SelectItem key={lesson.id} value={String(lesson.id)}>
                            {lesson.title || `Leçon #${lesson.id}`}
                            {lesson.module?.title && ` (${lesson.module.title})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions du quiz *</h3>
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
                  Ajouter une question
                </Button>
              </div>

              {questionFields.map((question, qIndex) => (
                <QuestionFields key={question.id} qIndex={qIndex} control={form.control} watch={form.watch} removeQuestion={removeQuestion} />
              ))}

              {form.formState.errors.questions && (
                <p className="text-sm text-destructive">{form.formState.errors.questions.message}</p>
              )}
            </div>

            <Button type="submit">{submitLabel}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Helper component for managing a question
function QuestionFields({ qIndex, control, watch, removeQuestion }: { qIndex: number; control: any; watch: any; removeQuestion: (index: number) => void }) {
  const { fields: responseFields, append: appendResponse, remove: removeResponse } = useFieldArray({
    control,
    name: `questions.${qIndex}.reponses`,
  })

  return (
    <div className="space-y-4 border p-4 rounded-md relative">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-md font-medium">Question #{qIndex + 1}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
          <MinusCircle className="h-4 w-4" />
        </Button>
      </div>

      <FormField
        control={control}
        name={`questions.${qIndex}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titre de la question *</FormLabel>
            <FormControl>
              <Input placeholder="Quelle est la capitale de la France ?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`questions.${qIndex}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (optionnel)</FormLabel>
            <FormControl>
              <Textarea placeholder="Contexte ou explication supplémentaire..." {...field} rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`questions.${qIndex}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de question *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Choix unique</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Choix multiples</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`questions.${qIndex}.points`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2 pl-4 border-l-2">
        <h5 className="text-base font-medium">Réponses *</h5>
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FormControl>
                    <Badge variant={field.value ? "default" : "destructive"} className="ml-2">
                      {field.value ? "Bonne réponse" : "Mauvaise réponse"}
                    </Badge>
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
                        placeholder={isCorrect ? "Texte de la bonne réponse" : "Texte de la mauvaise réponse"}
                        {...field}
                        className={isCorrect ? "border-green-500" : "border-red-300"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeResponse(rIndex)}>
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
          Ajouter une réponse
        </Button>
      </div>
    </div>
  )
}

