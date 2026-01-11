"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Shield, Users, BookOpen, Award, Beaker } from "lucide-react" // Added Beaker
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
      label: t('dashboard.quick_actions.manage_cohorts'),
      icon: Users,
      href: "/admin/cohortes",
      color: "text-[hsl(var(--info))]",
    },
    {
      label: t('dashboard.quick_actions.manage_labs'),
      icon: Beaker,
      href: "/admin/labs",
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => router.push(action.href)}
              >
                <Icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

