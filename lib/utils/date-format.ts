/**
 * Formate une date en "il y a X temps" sans dépendance externe
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "À l'instant"
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 604800)} sem`
  if (diffInSeconds < 31536000) return `Il y a ${Math.floor(diffInSeconds / 2592000)} mois`
  return `Il y a ${Math.floor(diffInSeconds / 31536000)} an${Math.floor(diffInSeconds / 31536000) > 1 ? "s" : ""}`
}

