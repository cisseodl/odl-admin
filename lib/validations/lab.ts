import { z } from "zod"

export const labSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  uploadedFiles: z.string().optional(), // JSON array de chemins/URLs
  resourceLinks: z.string().optional(), // JSON array d'URLs
  estimatedDurationMinutes: z.number().min(1, "La durée estimée est requise et doit être un nombre positif"),
  instructions: z.string().min(1, "Les instructions sont requises"),
  activate: z.boolean().default(true), // Assuming a default for activate
});

export type LabFormData = z.infer<typeof labSchema>
