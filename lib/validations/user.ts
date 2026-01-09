import { z } from "zod"

export const userSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"), // Renamed from name
  prenom: z.string().min(1, "Le prénom est requis").min(2, "Le prénom doit contenir au moins 2 caractères"), // Added prenom
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  numero: z.string().optional(), // Added numero
  profession: z.string().optional(), // Added profession
  niveauEtude: z.string().optional(), // Added niveauEtude
  filiere: z.string().optional(), // Added filiere
  cohorteId: z.coerce.number().optional(), // Added cohorteId for nested cohorte {id: ...} - use coerce to convert string to number
  role: z.enum(["Apprenant", "Instructeur", "Admin"], {
    required_error: "Le rôle est requis",
  }),
  status: z.enum(["Actif", "Inactif", "Suspendu"], {
    required_error: "Le statut est requis",
  }),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(), // Added password
})

export type UserFormData = z.infer<typeof userSchema>

