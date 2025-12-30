import { z } from "zod"

export const contentSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  type: z.enum(["Vidéo", "Document", "Image", "Quiz", "Fichier"], {
    required_error: "Le type est requis",
  }),
  course: z.string().min(1, "La formation est requise"),
  module: z.string().optional(),
  duration: z.string().optional(),
  size: z.string().optional(),
  status: z.enum(["Publié", "Brouillon"], {
    required_error: "Le statut est requis",
  }),
})

export type ContentFormData = z.infer<typeof contentSchema>

