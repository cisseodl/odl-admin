"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Shield, Users, BookOpen, Award, Beaker } from "lucide-react" // Added Beaker
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: "Ajouter un utilisateur",
      icon: Users,
      href: "/admin/users",
      color: "text-[hsl(var(--info))]",
    },
    {
      label: "Créer une formation",
      icon: BookOpen,
      href: "/admin/courses",
      color: "text-[hsl(var(--info))]",
    },
    {
      label: "Gérer les Cohortes", // Changed from "Modérer les contenus"
      icon: Users, // Using Users icon for Cohortes
      href: "/admin/cohortes", // Updated href
      color: "text-[hsl(var(--info))]", // Updated color for consistency
    },
    {
      label: "Gérer les Labs", // Changed from "Créer un badge"
      icon: Beaker, // Using Beaker icon for Labs
      href: "/admin/labs", // Updated href
      color: "text-[hsl(var(--info))]", // Updated color for consistency
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold leading-tight">Actions Rapides</CardTitle>
        <CardDescription className="text-sm leading-relaxed">Accès rapide aux actions fréquentes</CardDescription>
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

