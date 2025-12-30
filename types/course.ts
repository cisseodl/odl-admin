// Types pour la structure hiérarchique des cours (inspiré d'Udemy)

export interface Chapter {
  id: string
  title: string
  description?: string
  contentItems: ContentItem[]
  order: number
  duration?: string // Format: "15:30"
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface ContentItem {
  id: string
  type: "video" | "document" | "image" | "quiz" | "file" | "text"
  title: string
  description?: string
  url?: string // URL du fichier uploadé
  duration?: string // Pour les vidéos
  size?: string // Taille du fichier
  order: number
  isPublished: boolean
  metadata?: Record<string, unknown>
}

export interface Module {
  id: string
  title: string
  description?: string
  chapters: Chapter[]
  order: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CourseStructure {
  id: string
  courseId: number
  modules: Module[]
  totalDuration: string // Durée totale calculée
  totalChapters: number
  totalContentItems: number
  createdAt: string
  updatedAt: string
}

export interface CourseBuilderData {
  // Étape 1: Informations de base
  title: string
  subtitle?: string
  description: string
  category: string
  instructor: string
  language: string
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux"
  
  // Étape 2: Curriculum
  structure: CourseStructure
  
  // Étape 3: Landing Page
  thumbnail?: string
  promotionalVideo?: string
  learningObjectives: string[]
  prerequisites: string[]
  targetAudience: string[]
  
  // Étape 4: Paramètres
  status: "Brouillon" | "En révision" | "Publié"
  allowComments: boolean
  allowDownloads: boolean
  certificateEnabled: boolean
  
  // Étape 5: Publication
  publishDate?: string
  publishTime?: string
}

export interface CourseBuilderStep {
  id: string
  label: string
  description: string
  isCompleted: boolean
  isActive: boolean
  isValid: boolean
}

