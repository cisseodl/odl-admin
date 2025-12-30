import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground leading-tight">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">{description}</p>
      )}
    </div>
  )
}

