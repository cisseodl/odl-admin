import { z } from "zod"

export const certificationSchema = z.object({
  name: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  course: z.string().min(1, "La formation est requise"),
  validUntil: z.string().min(1, "La date de validité est requise"),
  requirements: z.string().min(1, "Les exigences sont requises"),
  status: z.enum(["Actif", "Expiré", "En attente"], {
    required_error: "Le statut est requis",
  }),
})

export type CertificationFormData = z.infer<typeof certificationSchema>

