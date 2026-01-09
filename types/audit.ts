// Types pour l'audit trail

export type AuditAction = "create" | "update" | "delete" | "view" | "approve" | "reject" | "login" | "logout"

export type AuditResource =
  | "user"
  | "course"
  | "instructor"
  | "category"
  | "certification"
  | "content"
  | "badge"
  | "announcement"
  | "review"
  | "system"

export interface AuditLog {
  id: number
  userId: number
  userName: string
  action: AuditAction
  resource: AuditResource
  resourceId?: number
  resourceName?: string
  details?: Record<string, unknown> // Détails supplémentaires
  ipAddress?: string
  userAgent?: string
  createdAt: string
  changes?: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
}

export interface AuditFilter {
  userId?: number
  action?: AuditAction
  resource?: AuditResource
  startDate?: string
  endDate?: string
  search?: string
}

