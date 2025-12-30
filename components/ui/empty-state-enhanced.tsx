"use client"

import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

type EmptyStateVariant = "no-data" | "no-results" | "error" | "default"

type EmptyStateEnhancedProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  variant?: EmptyStateVariant
  className?: string
}

const variantStyles: Record<EmptyStateVariant, { icon: string; title: string }> = {
  "no-data": {
    icon: "text-muted-foreground",
    title: "text-foreground",
  },
  "no-results": {
    icon: "text-muted-foreground",
    title: "text-foreground",
  },
  error: {
    icon: "text-destructive",
    title: "text-destructive",
  },
  default: {
    icon: "text-muted-foreground",
    title: "text-foreground",
  },
}

export function EmptyStateEnhanced({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateEnhancedProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4",
          variant === "error" && "bg-destructive/10"
        )}
      >
        <Icon className={cn("h-8 w-8", styles.icon)} aria-hidden="true" />
      </div>
      <h3 className={cn("text-lg font-semibold leading-tight", styles.title)}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick} variant={variant === "error" ? "outline" : "default"}>
            {action.icon}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}

