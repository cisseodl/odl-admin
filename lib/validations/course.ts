import { z } from "zod"

export const courseSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  subtitle: z.string().optional(), // Nouveau
  description: z.string().optional(),
  
  // imagePath sera géré par un File, pas directement dans le schema
  
  duration: z.string().min(1, "La durée est requise"), // Sera converti en secondes
  
  level: z.enum(["Beginner", "Intermediate", "Advanced"], { // Nouveau
    required_error: "Le niveau est requis",
  }),
  language: z.enum(["Français", "Anglais", "Espagnol", "Allemand"], { // Nouveau, exemples de langues
    required_error: "La langue est requise",
  }),
  bestseller: z.boolean().default(false).optional(), // Nouveau
  
  objectives: z.array(z.string()).optional(), // Nouveau, sera un tableau de strings
  features: z.array(z.string()).optional(), // Nouveau, sera un tableau de strings

  status: z.enum(["Publié", "Brouillon", "En révision"], {
    required_error: "Le statut est requis",
  }),
  
  price: z.number().min(0, "Le prix ne peut pas être négatif").optional(), // Nouveau

  categoryId: z.number().min(1, "La catégorie est requise"), // Adapté pour l'ID
  instructorId: z.number().min(1, "L'instructeur est requis"), // Adapté pour l'ID
})

export type CourseFormData = z.infer<typeof courseSchema>

