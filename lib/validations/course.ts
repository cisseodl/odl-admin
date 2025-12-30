import { z } from "zod"

export const courseSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  instructor: z.string().min(1, "L'instructeur est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  duration: z.string().min(1, "La durée est requise"),
  status: z.enum(["Publié", "Brouillon", "En révision"], {
    required_error: "Le statut est requis",
  }),
  description: z.string().optional(),
})

export type CourseFormData = z.infer<typeof courseSchema>

