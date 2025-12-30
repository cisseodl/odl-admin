// Types pour les notifications

export type NotificationType = "moderation" | "registration" | "alert" | "announcement" | "system"

export type NotificationStatus = "unread" | "read" | "archived"

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  status: NotificationStatus
  createdAt: string
  readAt?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, unknown> // Données supplémentaires (ex: userId, courseId)
}

export interface Announcement {
  id: number
  title: string
  content: string
  targetAudience: "all" | "admin" | "instructor" | "student"
  scheduledAt?: string
  sentAt?: string
  readCount: number
  totalRecipients: number
  status: "draft" | "scheduled" | "sent"
  createdAt: string
}

