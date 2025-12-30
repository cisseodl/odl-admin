import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { redirectToDashboard } from "@/lib/navigation"

/**
 * Hook pour rediriger automatiquement l'utilisateur connecté vers son dashboard
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectToDashboard(user.role, router)
    }
  }, [isAuthenticated, user, router])
}

