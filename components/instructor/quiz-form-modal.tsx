// components/instructor/quiz-form-modal.tsx
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Course } from "@/models"
import { PlusCircle, MinusCircle, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export enum QuestionType {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

const responseSchema = z.object({
  text: z.string().min(1, "Le texte de la réponse est requis."),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  content: z.string().min(5, "Le contenu de la question est requis."),
  type: z.nativeEnum(QuestionType, { required_error: "Le type de question est requis." }),
  points: z.number().min(1, "Les points de la question sont requis."),
  reponses: z.array(responseSchema).min(2, "Au moins deux réponses sont requises pour une question."),
});

const quizFormSchema = z.object({
  title: z.string().min(2, "Le titre du quiz doit contenir au moins 2 caractères."),
  courseId: z.number({ required_error: "Veuillez sélectionner un cours." }),
  lessonId: z.coerce.number().optional().nullable(),
  durationMinutes: z.number().min(1, "La durée en minutes est requise."),
  scoreMinimum: z.literal(80), // Fixé à 80% selon la règle métier du backend
  questions: z.array(questionSchema).min(1, "Au moins une question est requise pour le quiz."),
});

export type QuizFormData = z.infer<typeof quizFormSchema>

type QuizFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onSubmit: (data: QuizFormData) => void
  submitLabel: string
  defaultValues?: Partial<QuizFormData>
  courses: Course[] // To select which course to add the quiz to
}

export function QuizFormModal({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel,
  defaultValues,
  courses,
}: QuizFormModalProps) {
  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      ...defaultValues,
      scoreMinimum: 80, // Fixé à 80% selon la règle métier
      questions: defaultValues?.questions && defaultValues.questions.length > 0
        ? defaultValues.questions
        : [{ content: "", type: QuestionType.SINGLE_CHOICE, points: 1, reponses: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] }],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('instructor.quizzes.form.title') || "Titre du quiz"}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('instructor.quizzes.form.title_placeholder') || "Quiz : Notions Fondamentales"} {...field} />
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
                  <FormLabel>{t('instructor.quizzes.form.course') || "Cours associé"}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('instructor.quizzes.form.course_placeholder') || "Sélectionnez un cours"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="15" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scoreMinimum"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('instructor.quizzes.form.score_minimum') || "Score minimum (%)"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      value={80} 
                      disabled 
                      className="bg-muted cursor-not-allowed"
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t('instructor.quizzes.form.score_minimum_info') || "Le score minimum est fixé à 80% selon la règle métier."}</p>
                  <FormMessage />
                </FormItem>
                )}
              />
            </div>

            <div className="space-y-8">
              <h3 className="text-lg font-semibold">{t('instructor.quizzes.form.questions_title') || "Questions du quiz"}</h3>
              {questionFields.map((question, qIndex) => (
                <div key={question.id} className="space-y-4 border p-4 rounded-md relative">
                  <h4 className="text-md font-medium">{t('instructor.quizzes.form.question_number', { number: qIndex + 1 }) || `Question #${qIndex + 1}`}</h4>
                  <FormField
                    control={form.control}
                    name={`questions.${qIndex}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('instructor.quizzes.form.question_content') || "Contenu de la question"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('instructor.quizzes.form.question_content_placeholder') || "Quelle est la capitale de la France ?"} {...field} />
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
                          <FormLabel>{t('instructor.quizzes.form.question_type') || "Type de question"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('instructor.quizzes.form.question_type_placeholder') || "Sélectionnez un type"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={QuestionType.SINGLE_CHOICE}>{t('instructor.quizzes.form.type_single_choice') || "Choix unique"}</SelectItem>
                              <SelectItem value={QuestionType.MULTIPLE_CHOICE}>{t('instructor.quizzes.form.type_multiple_choice') || "Choix multiples"}</SelectItem>
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
                          <FormLabel>{t('instructor.quizzes.form.points') || "Points"}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder={t('instructor.quizzes.form.points_placeholder') || "10"} {...field} onChange={event => field.onChange(Number(event.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2 pl-4 border-l-2">
                    <h5 className="text-base font-medium">{t('instructor.quizzes.form.responses_title') || "Réponses"}</h5>
                    <ResponseFields qIndex={qIndex} control={form.control} watch={form.watch} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentResponses = form.getValues(`questions.${qIndex}.reponses`);
                        form.setValue(`questions.${qIndex}.reponses`, [...currentResponses, { text: "", isCorrect: false }]);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> {t('instructor.quizzes.form.add_response') || "Ajouter une réponse"}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={() => appendQuestion({ content: "", type: QuestionType.SINGLE_CHOICE, points: 1, reponses: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] })}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter une question
              </Button>
            </div>

            <Button type="submit">{submitLabel}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Helper component for managing responses within a question
function ResponseFields({ qIndex, control, watch }: { qIndex: number, control: any, watch: any }) {
  const { t } = useLanguage();
  const { fields: responseFields, append: appendResponse, remove: removeResponse } = useFieldArray({
    control,
    name: `questions.${qIndex}.reponses`,
  });

  return (
    <div className="space-y-2">
      {responseFields.map((response, rIndex) => {
        const isCorrect = watch(`questions.${qIndex}.reponses.${rIndex}.isCorrect`) || false;
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
                        {field.value ? "Bonne réponse" : "Mauvaise réponse"}
                      </Badge>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`questions.${qIndex}.reponses.${rIndex}.text`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input 
                      placeholder={isCorrect ? (t('instructor.quizzes.form.response_correct_placeholder') || "Texte de la bonne réponse") : (t('instructor.quizzes.form.response_wrong_placeholder') || "Texte de la mauvaise réponse")} 
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
        );
      })}
    </div>
  );
}