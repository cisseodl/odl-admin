"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, List, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const { t } = useLanguage()
  const router = useRouter()

  const actions = [
    {
      label: t('dashboard.quick_actions.add_user'),
      icon: Users,
      href: "/admin/users",
      color: "text-[hsl(var(--info))]",
    },
    {
      label: t('dashboard.quick_actions.create_course'),
      icon: BookOpen,
      href: "/admin/courses",
      color: "text-[hsl(var(--info))]",
    },
    {
      label: t('dashboard.quick_actions.manage_sections'),
      icon: List,
      href: "/admin/sections",
      color: "text-[hsl(var(--info))]",
    },
    {
      label: t('dashboard.quick_actions.odc_formations'),
      icon: GraduationCap,
      href: "/admin/odc-formations",
      color: "text-[hsl(var(--info))]",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold leading-tight">{t('dashboard.quick_actions.title')}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{t('dashboard.quick_actions.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="h-auto flex-col gap-1.5 py-2.5"
                onClick={() => router.push(action.href)}
              >
                <Icon className={`h-4 w-4 ${action.color}`} />
                <span className="text-xs">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

