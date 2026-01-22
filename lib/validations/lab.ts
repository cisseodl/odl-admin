import { z } from "zod"

export const labSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(1, "La description est requise"),
  lessonId: z.coerce.number({
    required_error: "La leçon est requise",
    invalid_type_error: "La leçon doit être sélectionnée",
  }).min(1, "La leçon est requise"),
  labType: z.enum(["file", "link", "instructions"], {
    required_error: "Vous devez choisir un type de lab",
  }),
  uploadedFiles: z.string().optional(),
  resourceLinks: z.string().optional(),
  // Utiliser coerce pour convertir automatiquement string -> number depuis les inputs HTML
  estimatedDurationMinutes: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) {
        return undefined; // Laisser Zod gérer l'erreur required
      }
      const num = Number(val);
      if (isNaN(num)) {
        return undefined; // Laisser Zod gérer l'erreur invalid_type
      }
      return Math.floor(num); // Convertir en entier
    },
    z.number({
      required_error: "La durée estimée est requise",
      invalid_type_error: "La durée estimée doit être un nombre",
    }).min(1, "La durée estimée doit être au moins 1 minute")
  ),
  maxDurationMinutes: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) {
        return undefined; // Laisser Zod gérer l'erreur required
      }
      const num = Number(val);
      if (isNaN(num)) {
        return undefined; // Laisser Zod gérer l'erreur invalid_type
      }
      return Math.floor(num); // Convertir en entier
    },
    z.number({
      required_error: "La durée maximale est requise",
      invalid_type_error: "La durée maximale doit être un nombre",
    }).min(1, "La durée maximale doit être au moins 1 minute")
  ),
  instructions: z.string().optional(),
  activate: z.boolean().default(true),
}).refine((data) => {
  // Validation conditionnelle : au moins un des trois doit être rempli selon le type choisi
  if (data.labType === "file") {
    return data.uploadedFiles && data.uploadedFiles !== "" && data.uploadedFiles !== "[]"
  } else if (data.labType === "link") {
    return data.resourceLinks && data.resourceLinks !== "" && data.resourceLinks !== "[]"
  } else if (data.labType === "instructions") {
    return data.instructions && data.instructions.trim().length > 0
  }
  return false
}, {
  message: "Veuillez fournir le contenu requis selon le type sélectionné",
  path: ["labType"],
}).refine((data) => {
  // La durée maximale doit être >= durée estimée
  return data.maxDurationMinutes >= data.estimatedDurationMinutes
}, {
  message: "La durée maximale doit être ≥ à la durée estimée",
  path: ["maxDurationMinutes"],
}).refine((data) => {
  // La leçon est obligatoire
  return data.lessonId != null && data.lessonId > 0
}, {
  message: "La leçon est requise",
  path: ["lessonId"],
});

export type LabFormData = z.infer<typeof labSchema>
