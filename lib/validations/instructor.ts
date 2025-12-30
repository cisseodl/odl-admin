import { z } from "zod"

export const instructorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  phone: z.string().optional(), // Added phone
  qualifications: z.string().min(1, "Les qualifications sont requises"), // Renamed from specialization
  bio: z.string().optional(),
  imagePath: z.string().optional(), // Added imagePath
  status: z.enum(["Actif", "Inactif", "En attente"], {
    required_error: "Le statut est requis",
  }),
})

export type InstructorFormData = z.infer<typeof instructorSchema>

