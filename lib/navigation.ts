import type { UserRole } from "@/types"

/**
 * Retourne l'URL de redirection selon le rôle de l'utilisateur
 */
export function getDashboardUrl(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    admin: "/admin",
    instructor: "/instructor",
  }
  
  return roleMap[role] || "/login"
}

/**
 * Redirige l'utilisateur vers son dashboard selon son rôle
 */
export function redirectToDashboard(role: UserRole, router: { push: (url: string) => void }): void {
  const url = getDashboardUrl(role)
  router.push(url)
}

