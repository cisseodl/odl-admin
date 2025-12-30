"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

type ComparisonMetric = {
  label: string
  current: number | string
  previous: number | string
  unit?: string
  format?: "number" | "currency" | "percentage"
}

type ComparisonStatsProps = {
  title?: string
  description?: string
  period?: "month" | "year"
  metrics: ComparisonMetric[]
}

export function ComparisonStats({ title = "Comparaison", description, period = "month", metrics }: ComparisonStatsProps) {
  const formatValue = (value: number | string, format?: string, unit?: string) => {
    if (typeof value === "string") return value

    switch (format) {
      case "currency":
        return `€${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      case "percentage":
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString("fr-FR") + (unit ? ` ${unit}` : "")
    }
  }

  const calculateChange = (current: number | string, previous: number | string): { value: number; percentage: number } => {
    const curr = typeof current === "string" ? parseFloat(current.replace(/[^\d.-]/g, "")) : current
    const prev = typeof previous === "string" ? parseFloat(previous.replace(/[^\d.-]/g, "")) : previous

    if (prev === 0) {
      return { value: curr, percentage: curr > 0 ? 100 : 0 }
    }

    const change = curr - prev
    const percentage = (change / prev) * 100

    return { value: change, percentage }
  }

  const periodLabel = period === "month" ? "mois précédent" : "année précédente"

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const currentNum = typeof metric.current === "string" ? parseFloat(metric.current.replace(/[^\d.-]/g, "")) : metric.current
            const previousNum = typeof metric.previous === "string" ? parseFloat(metric.previous.replace(/[^\d.-]/g, "")) : metric.previous

            const { value: changeValue, percentage } = calculateChange(currentNum, previousNum)
            const isPositive = changeValue > 0
            const isNeutral = changeValue === 0

            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border shadow-sm bg-card">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatValue(currentNum, metric.format, metric.unit)}</span>
                    <span className="text-sm text-muted-foreground">vs {formatValue(previousNum, metric.format, metric.unit)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!isNeutral ? (
                    <>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          isPositive ? "text-[hsl(var(--success))]" : "text-destructive"
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(percentage).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isPositive ? "+" : ""}
                        {formatValue(changeValue, metric.format, metric.unit)}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <Minus className="h-4 w-4" />
                        0%
                      </div>
                      <p className="text-xs text-muted-foreground">Aucun changement</p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
          Comparaison avec le {periodLabel}
        </div>
      </CardContent>
    </Card>
  )
}

