"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const routeLabels: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/users": "Utilisateurs",
  "/admin/courses": "Formations",
  "/admin/instructors": "Instructeurs",
  "/admin/categories": "Catégories",
  "/admin/certifications": "Certifications",
  "/admin/analytics": "Statistiques",
  "/admin/reviews": "Commentaires",
  "/admin/content": "Contenus",
  "/admin/moderation": "Modération",
  "/admin/notifications": "Notifications",
  "/admin/badges": "Badges",
  "/admin/leaderboard": "Classements",
  "/admin/settings": "Paramètres",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const paths = pathname.split("/").filter(Boolean)

  const breadcrumbs = paths.map((path, index) => {
    const href = "/" + paths.slice(0, index + 1).join("/")
    const label = routeLabels[href] || path.charAt(0).toUpperCase() + path.slice(1)
    return { href, label }
  })

  if (pathname === "/admin") {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link
            href="/admin"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Tableau de bord"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Tableau de bord</span>
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

