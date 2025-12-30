// Types d'authentification
export type UserRole = "admin" | "instructor"

export interface User {
  id?: string
  email: string
  role: UserRole
  name: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Types de formations
export interface Course {
  id: number
  title: string
  description?: string
  duration: string
  students: number
  rating: number
  status: "Publié" | "Brouillon" | "En révision"
  createdAt: string
  modules?: number
  chapters?: number
  videos?: number
}

// Types d'utilisateurs
export interface AppUser {
  id: number
  name: string
  email: string
  role: "Étudiant" | "Formateur" | "Administrateur"
  status: "Actif" | "Inactif" | "En attente"
  joinedDate: string
  courses?: number
  avatar?: string
}

// Types d'instructeurs
export interface Instructor {
  id: number
  name: string
  email: string
  specialization: string
  courses: number
  students: number
  rating: number
  status: "Actif" | "Inactif" | "En attente"
  joinedDate: string
  avatar?: string
}

// Types de catégories
export interface Category {
  id: number
  name: string
  description: string
  color: string
  courses: number
}

// Types de certifications
export interface Certification {
  id: number
  name: string
  course: string
  issued: number
  validUntil: string
  status: "Actif" | "Expiré" | "En attente"
  requirements: string
}

// Types de contenu
export interface Content {
  id: number
  title: string
  type: "Vidéo" | "Document" | "Image" | "Quiz" | "Fichier"
  course: string
  module?: string
  duration?: string
  size?: string
  uploadDate: string
  status: "Publié" | "Brouillon"
}

// Types de quiz
export interface Quiz {
  id: number
  title: string
  course: string
  module: string
  questions: number
  type: "Quiz" | "Exercice"
  attempts: number
  averageScore: number
  status: "Actif" | "Brouillon"
  createdAt: string
}

// Types d'apprenants
export interface Student {
  id: number
  name: string
  email: string
  course: string
  progress: number
  score: number
  completedModules: number
  totalModules: number
  lastActivity: string
  avatar?: string
}

// Types de certificats
export interface Certificate {
  id: number
  studentName: string
  studentEmail: string
  course: string
  issuedDate: string
  validUntil: string
  status: "Valide" | "Expiré"
  avatar?: string
}

// Types de commentaires
export interface Review {
  id: number
  student: string
  course: string
  rating: number
  comment: string
  date: string
  status: "Approuvé" | "En attente" | "Rejeté"
}

import type { ComponentType } from "react"

// Types de routes
export interface Route {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
  children?: Route[] // Add optional children for sub-menus
}

