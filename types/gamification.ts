// Types pour la gamification

export type BadgeType = "completion" | "score" | "participation" | "time" | "streak"

export interface Badge {
  id: number
  name: string
  description: string
  type: BadgeType
  icon: string
  color: string
  criteria: BadgeCriteria
  enabled: boolean
  createdAt: string
  updatedAt?: string
  awardedCount?: number
}

export interface BadgeCriteria {
  type: BadgeType
  threshold?: number // Pour completion, score, time
  condition?: string // Condition personnalisée
  minScore?: number // Score minimum requis
  minCourses?: number // Nombre minimum de cours
  consecutiveDays?: number // Jours consécutifs pour streak
  timeSpent?: number // Temps passé en heures
}

export interface BadgeAward {
  id: number
  badgeId: number
  userId: number
  awardedAt: string
  progress?: number // Pourcentage de progression vers le badge
}

export interface PointsRule {
  action: string
  points: number
  description: string
}

export interface UserPoints {
  userId: number
  totalPoints: number
  pointsByCategory: {
    completion: number
    quiz: number
    participation: number
    badges: number
  }
  lastUpdated: string
}

export interface LeaderboardEntry {
  rank: number
  userId: number
  userName: string
  avatar?: string
  coursesCompleted: number
  certifications: number // Ajouté
  change?: number // Changement de position
}

