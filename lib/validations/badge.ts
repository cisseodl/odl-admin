import { z } from "zod"

export const badgeCriteriaSchema = z.object({
  type: z.enum(["completion", "score", "participation", "time", "streak"]),
  threshold: z.number().min(0).optional(),
  condition: z.string().optional(),
  minScore: z.number().min(0).max(100).optional(),
  minCourses: z.number().min(1).optional(),
  consecutiveDays: z.number().min(1).optional(),
  timeSpent: z.number().min(0).optional(),
})

export const badgeSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  description: z.string().min(1, "La description est requise").max(500, "La description est trop longue"),
  type: z.enum(["completion", "score", "participation", "time", "streak"]),
  icon: z.string().min(1, "L'icône est requise"),
  color: z.string().regex(/^bg-\w+-\d+$/, "Format de couleur invalide (ex: bg-blue-500)"),
  criteria: badgeCriteriaSchema,
  enabled: z.boolean().default(true),
})

export type BadgeFormData = z.infer<typeof badgeSchema>

