"use client"

import { useAutoLogout } from "@/hooks/use-auto-logout"

/**
 * Composant wrapper pour utiliser le hook useAutoLogout
 * Ce composant ne rend rien, il surveille juste l'inactivité
 */
export function AutoLogoutHandler() {
  useAutoLogout()
  return null
}
