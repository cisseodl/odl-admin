"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useMemo } from "react"; // Ajout de useEffect, useState, useMemo
import { analyticsService, OverallComparisonStats } from "@/services/analytics.service"; // Corrected Import service et type
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader

type ComparisonMetric = {
  label: string
  current: number | string
  previous: number | string
  unit?: string
  format?: "number" | "currency" | "percentage"
}

interface ComparisonStatsProps {
  title?: string
  description?: string
  // Removed period, timeFilter, startDate, endDate from props
}

export function ComparisonStats({ title, description }: ComparisonStatsProps) { // Removed period, timeFilter, startDate, endDate
  const { t } = useLanguage()
  const [statsData, setStatsData] = useState<OverallComparisonStats | null>(null); // Corrected type
  const [loading, setLoading] = useState(true);
  const [error, setError, ] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisonStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedData = await analyticsService.getComparisonStats(); // Removed arguments
        setStatsData(fetchedData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch comparison stats data.");
        console.error("Error fetching comparison stats data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparisonStats();
  }, []); // Empty dependency array as period and timeFilter are no longer props

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

  const metrics: ComparisonMetric[] = useMemo(() => {
    if (!statsData) return [];

    return [
      {
        label: t('dashboard.comparison.metrics.registrations'),
        current: statsData.registrationsCurrentPeriod,
        previous: statsData.registrationsPreviousPeriod,
        format: "number",
      },
      {
        label: t('dashboard.comparison.metrics.completion_rate'),
        current: statsData.completionRateCurrentPeriod,
        previous: statsData.completionRatePreviousPeriod,
        format: "percentage",
      },
      {
        label: t('dashboard.comparison.metrics.courses_created'),
        current: statsData.coursesCreatedCurrentPeriod,
        previous: statsData.coursesCreatedPreviousPeriod,
        format: "number",
      },
      {
        label: t('dashboard.comparison.metrics.active_users'),
        current: statsData.activeUsersCurrentPeriod,
        previous: statsData.activeUsersPreviousPeriod,
        format: "number",
      },
    ];
  }, [statsData, t]);


  // Removed periodLabel as period is no longer a prop
  const periodLabel = t('dashboard.comparison.previous_period'); // Default label

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
  }

  if (!statsData || metrics.length === 0) {
    return <div className="text-center text-muted-foreground p-4">{t('dashboard.comparison.no_data')}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || t('dashboard.comparison.title')}</CardTitle>
        {description && <CardDescription>{description || t('dashboard.comparison.description')}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const currentNum = typeof metric.current === "string" ? parseFloat(metric.current.replace(/[^\d.-]/g, "")) : metric.current
            const previousNum = typeof metric.previous === "string" ? parseFloat(metric.previous.replace(/[^\d.-]/g, "")) : metric.previous // Corrected line

            const { value: changeValue, percentage } = calculateChange(currentNum, previousNum)
            const isPositive = percentage > 0
            const isNeutral = percentage === 0

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
                      <p className="text-xs text-muted-foreground">{t('dashboard.comparison.no_change')}</p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
          {t('dashboard.comparison.comparison_with', { period: periodLabel })}
        </div>
      </CardContent>
    </Card>
  )
}