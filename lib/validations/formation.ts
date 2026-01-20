import { z } from "zod"

export const formationSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  imagePath: z.string().optional(),
  categorieId: z.number({
    required_error: "La catégorie est requise",
    invalid_type_error: "Veuillez sélectionner une catégorie",
  }),
  activate: z.boolean().default(true),
})

export type FormationFormData = z.infer<typeof formationSchema>

