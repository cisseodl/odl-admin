"use client"

import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumbs() {
  const { t } = useLanguage()
  
  const routeLabels: Record<string, string> = {
    "/admin": t('routes.dashboard'),
    "/admin/users": t('routes.users'),
    "/admin/courses": t('routes.courses'),
    "/admin/instructors": t('routes.instructors'),
    "/admin/categories": t('routes.categories'),
    "/admin/certifications": t('routes.certifications'),
    "/admin/analytics": t('routes.analytics'),
    "/admin/reviews": t('routes.reviews'),
    "/admin/content": t('routes.content'),
    "/admin/moderation": t('routes.moderation'),
    "/admin/notifications": t('routes.notifications'),
    "/admin/badges": t('routes.badges'),
    "/admin/leaderboard": t('routes.leaderboard'),
    "/admin/settings": t('routes.settings'),
    "/admin/sections": t('dashboard.quick_actions.manage_sections'),
    "/admin/odc-formations": t('dashboard.quick_actions.odc_formations'),
  }

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
    <nav aria-label={t('common.breadcrumb')} className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link
            href="/admin"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label={t('routes.dashboard')}
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">{t('routes.dashboard')}</span>
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

