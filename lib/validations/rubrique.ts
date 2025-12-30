import { z } from "zod"

export const rubriqueSchema = z.object({
  rubrique: z.string().min(1, "Le nom de la rubrique est requis"),
  image: z.string().optional(), // For update (path)
  imageFile: z.instanceof(File).optional(), // For create (file upload)
  description: z.string().optional(),
  objectifs: z.string().optional(),
  publicCible: z.string().optional(), // Updated casing
  dureeFormat: z.string().optional(), // Updated casing
  lienRessources: z.string().optional(),
})

export type RubriqueFormData = z.infer<typeof rubriqueSchema>
