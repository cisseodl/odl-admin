import { z } from "zod"

export const tdSchema = z.object({
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
  tpInstructions: z.string().min(1, "Les instructions du TD sont requises"),
  tpFileUrl: z.string().optional(),
})

export type TDFormData = z.infer<typeof tdSchema>

