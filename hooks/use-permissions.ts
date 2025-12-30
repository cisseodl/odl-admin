import { useAuth } from "@/contexts/auth-context"
import { PermissionEngine } from "@/lib/permissions/permission-engine"
import type { PermissionAction, PermissionResource, Role } from "@/types/permissions"

// Rôles par défaut (simulés)
const DEFAULT_ROLES: Record<string, Role> = {
  admin: {
    id: 1,
    name: "admin",
    description: "Administrateur avec tous les droits",
    permissions: [],
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  instructor: {
    id: 2,
    name: "instructor",
    description: "Instructeur avec droits limités",
    permissions: [
      { resource: "courses", actions: ["create", "read", "update"] },
      { resource: "content", actions: ["create", "read", "update"] },
      { resource: "reviews", actions: ["read"] },
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
}

export function usePermissions() {
  const { user } = useAuth()

  const getCurrentRole = (): Role | null => {
    if (!user) return null
    return DEFAULT_ROLES[user.role] || null
  }

  const can = (resource: PermissionResource, action: PermissionAction): boolean => {
    const role = getCurrentRole()
    return PermissionEngine.can(role, resource, action)
  }

  const hasAnyPermission = (resource: PermissionResource, actions: PermissionAction[]): boolean => {
    return actions.some((action) => can(resource, action))
  }

  const hasAllPermissions = (resource: PermissionResource, actions: PermissionAction[]): boolean => {
    return actions.every((action) => can(resource, action))
  }

  return {
    can,
    hasAnyPermission,
    hasAllPermissions,
    getCurrentRole,
    isAdmin: user?.role === "admin",
  }
}

