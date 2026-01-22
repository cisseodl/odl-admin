"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

type StatusBadgeProps = {
  status: string
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary" | "outline"
  className?: string
}

const statusVariantMap: Record<string, VariantProps<typeof Badge>["variant"]> = {
  "Actif": "default",
  "Publié": "default",
  "Valide": "default",
  "Complété": "default",
  "Approuvé": "default",
  "Inactif": "secondary",
  "Brouillon": "secondary",
  "En attente": "outline",
  "En révision": "outline",
  "Suspendu": "error",
  "Expiré": "error",
  "Échoué": "error",
  "Rejeté": "error",
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  if (!status) {
    return null
  }
  
  const badgeVariant = variant || statusVariantMap[status] || "secondary"

  return (
    <Badge variant={badgeVariant} className={cn("flex items-center gap-1 w-fit", className)}>
      {status}
    </Badge>
  )
}

