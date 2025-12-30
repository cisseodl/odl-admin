import { z } from "zod"

// Validation pour ContentItem
export const contentItemSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "document", "image", "quiz", "file", "text"]),
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  url: z.string().optional(),
  duration: z.string().optional(),
  size: z.string().optional(),
  order: z.number().min(0),
  isPublished: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
})

// Validation pour Chapter
export const chapterSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  contentItems: z.array(contentItemSchema).default([]),
  order: z.number().min(0),
  duration: z.string().optional(),
  isPublished: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Validation pour Module
export const moduleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  chapters: z.array(chapterSchema).default([]),
  order: z.number().min(0),
  isPublished: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Validation pour CourseStructure
export const courseStructureSchema = z.object({
  id: z.string(),
  courseId: z.number().optional(),
  modules: z.array(moduleSchema).default([]),
  totalDuration: z.string().default("0h 0min"),
  totalChapters: z.number().default(0),
  totalContentItems: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Validation pour chaque étape du builder
export const step1BasicInfoSchema = z.object({
  title: z.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  instructor: z.string().min(1, "L'instructeur est requis"),
  language: z.string().min(1, "La langue est requise"),
  level: z.enum(["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"]),
})

export const step2CurriculumSchema = z.object({
  structure: courseStructureSchema,
})

export const step3LandingPageSchema = z.object({
  thumbnail: z.string().optional(),
  promotionalVideo: z.string().optional(),
  learningObjectives: z.array(z.string().min(1)).min(1, "Au moins un objectif d'apprentissage est requis"),
  prerequisites: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
})

export const step4SettingsSchema = z.object({
  status: z.enum(["Brouillon", "En révision", "Publié"]),
  allowComments: z.boolean().default(true),
  allowDownloads: z.boolean().default(true),
  certificateEnabled: z.boolean().default(false),
})

export const step5PublishSchema = z.object({
  publishDate: z.string().optional(),
  publishTime: z.string().optional(),
})

// Schema complet pour le Course Builder
export const courseBuilderSchema = step1BasicInfoSchema
  .merge(step2CurriculumSchema)
  .merge(step3LandingPageSchema)
  .merge(step4SettingsSchema)
  .merge(step5PublishSchema)

export type ContentItemFormData = z.infer<typeof contentItemSchema>
export type ChapterFormData = z.infer<typeof chapterSchema>
export type ModuleFormData = z.infer<typeof moduleSchema>
export type CourseStructureFormData = z.infer<typeof courseStructureSchema>
export type Step1BasicInfoData = z.infer<typeof step1BasicInfoSchema>
export type Step2CurriculumData = z.infer<typeof step2CurriculumSchema>
export type Step3LandingPageData = z.infer<typeof step3LandingPageSchema>
export type Step4SettingsData = z.infer<typeof step4SettingsSchema>
export type Step5PublishData = z.infer<typeof step5PublishSchema>
export type CourseBuilderFormData = z.infer<typeof courseBuilderSchema>

