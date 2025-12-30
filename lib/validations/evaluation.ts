// lib/validations/evaluation.ts
import { z } from "zod";

export const evaluationFormSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis." }),
  description: z.string().optional(),
  status: z.enum(["Draft", "Active", "Archived"], {
    required_error: "Le statut est requis.",
  }),
});

export type EvaluationFormData = z.infer<typeof evaluationFormSchema>;
