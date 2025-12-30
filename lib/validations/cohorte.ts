import { z } from "zod"

export const cohorteSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  dateDebut: z.string().min(1, "La date de début est requise"), // ISO string format
  dateFin: z.string().min(1, "La date de fin est requise"), // ISO string format
})

export type CohorteFormData = z.infer<typeof cohorteSchema>