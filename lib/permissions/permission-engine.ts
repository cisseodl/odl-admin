import type { Permission, PermissionAction, PermissionResource, Role } from "@/types/permissions"

export class PermissionEngine {
  /**
   * Vérifie si un rôle a une permission spécifique
   */
  static hasPermission(role: Role, resource: PermissionResource, action: PermissionAction): boolean {
    const permission = role.permissions.find((p) => p.resource === resource)
    if (!permission) return false
    return permission.actions.includes(action)
  }

  /**
   * Vérifie si un utilisateur avec un rôle peut effectuer une action
   */
  static can(role: Role | null, resource: PermissionResource, action: PermissionAction): boolean {
    if (!role) return false

    // Les admins ont tous les droits
    if (role.name === "admin") return true

    return this.hasPermission(role, resource, action)
  }

  /**
   * Obtient toutes les permissions d'un rôle pour une ressource
   */
  static getPermissionsForResource(role: Role, resource: PermissionResource): PermissionAction[] {
    const permission = role.permissions.find((p) => p.resource === resource)
    return permission?.actions || []
  }

  /**
   * Crée un nouveau rôle avec des permissions
   */
  static createRole(
    name: string,
    description: string,
    permissions: Permission[]
  ): Omit<Role, "id" | "createdAt"> {
    return {
      name,
      description,
      permissions,
      isSystem: false,
    }
  }

  /**
   * Valide qu'un rôle a au moins une permission
   */
  static validateRole(role: Omit<Role, "id" | "createdAt">): { valid: boolean; error?: string } {
    if (!role.name || role.name.trim().length === 0) {
      return { valid: false, error: "Le nom du rôle est requis" }
    }

    if (role.permissions.length === 0) {
      return { valid: false, error: "Le rôle doit avoir au moins une permission" }
    }

    // Vérifier que chaque permission a au moins une action
    for (const permission of role.permissions) {
      if (permission.actions.length === 0) {
        return { valid: false, error: `La ressource ${permission.resource} doit avoir au moins une action` }
      }
    }

    return { valid: true }
  }
}

