import { z } from "zod"

export const categorySchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>