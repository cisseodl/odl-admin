"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type StatCardProps = {
  title: string
  value: string
  change?: string
  icon: LucideIcon
  color?: string
  className?: string
  children?: ReactNode
}

export function StatCard({ title, value, change, icon: Icon, color, className, children }: StatCardProps) {
  return (
    <Card className={cn("relative", className)}>
      {children}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground leading-tight">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", color || "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            <span className={change.startsWith("+") ? "text-[hsl(var(--success))]" : "text-destructive"}>{change}</span> par rapport au mois dernier
          </p>
        )}
      </CardContent>
    </Card>
  )
}

