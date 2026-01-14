"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { authService } from "@/lib/auth"

const INACTIVITY_TIMEOUT = 30 * 1000 // 30 secondes en millisecondes

/**
 * Hook pour déconnecter automatiquement l'utilisateur après 30 secondes d'inactivité
 */
export function useAutoLogout() {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const resetTimer = useCallback(() => {
    // Nettoyer le timer précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Si l'utilisateur n'est pas authentifié, ne pas créer de timer
    if (!isAuthenticated) {
      return
    }

    // Mettre à jour le temps de dernière activité
    lastActivityRef.current = Date.now()

    // Créer un nouveau timer pour la déconnexion
    timeoutRef.current = setTimeout(() => {
      console.log("Déconnexion automatique après 30 secondes d'inactivité")
      
      // Déconnecter l'utilisateur
      logout()
      authService.signOut()
      
      // Rediriger vers la page de connexion
      router.push("/login")
    }, INACTIVITY_TIMEOUT)
  }, [isAuthenticated, logout, router])

  useEffect(() => {
    // Ne pas créer de timer si l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Événements à surveiller pour détecter l'activité
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ]

    // Ajouter les listeners d'événements
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    // Initialiser le timer au montage
    resetTimer()

    // Nettoyer les listeners et le timer au démontage
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isAuthenticated, resetTimer])

  // Réinitialiser le timer quand l'authentification change
  useEffect(() => {
    if (isAuthenticated) {
      resetTimer()
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isAuthenticated, resetTimer])
}
