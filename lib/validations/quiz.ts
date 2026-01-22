import { z } from "zod"

export const quizSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  courseId: z.coerce.number({
    required_error: "Le cours est requis",
    invalid_type_error: "Le cours doit être sélectionné",
  }).min(1, "Vous devez sélectionner un cours"),
  lessonId: z.coerce.number({
    required_error: "La leçon est requise",
    invalid_type_error: "La leçon doit être sélectionnée",
  }).min(1, "Vous devez sélectionner une leçon"),
  questions: z.array(z.object({
    title: z.string().min(1, "Le titre de la question est requis"),
    description: z.string().optional(),
    type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]),
    points: z.coerce.number().min(1, "Les points doivent être au moins 1"),
    reponses: z.array(z.object({
      title: z.string().min(1, "Le titre de la réponse est requis"),
      isCorrect: z.boolean(),
    })).min(2, "Au moins 2 réponses sont requises"),
  })).min(1, "Au moins une question est requise"),
})

export type QuizFormData = z.infer<typeof quizSchema>

