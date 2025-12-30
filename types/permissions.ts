// Types pour les permissions

export type PermissionAction = "create" | "read" | "update" | "delete" | "moderate"

export type PermissionResource =
  | "users"
  | "courses"
  | "instructors"
  | "categories"
  | "certifications"
  | "content"
  | "badges"
  | "announcements"
  | "reviews"
  | "reports"
  | "settings"

export interface Permission {
  resource: PermissionResource
  actions: PermissionAction[]
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
  isSystem: boolean // Rôles système ne peuvent pas être modifiés
  createdAt: string
}

export interface UserRole {
  userId: number
  roleId: number
  assignedAt: string
}

