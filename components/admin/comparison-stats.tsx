"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useMemo, useCallback } from "react"; // Ajout de useEffect, useState, useMemo, useCallback
import { analyticsService, OverallComparisonStats } from "@/services/analytics.service"; // Corrected Import service et type
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Cell } from "recharts"

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

  const calculateChange = useCallback((current: number | string, previous: number | string): { value: number; percentage: number } => {
    const curr = typeof current === "string" ? parseFloat(current.replace(/[^\d.-]/g, "")) : current
    const prev = typeof previous === "string" ? parseFloat(previous.replace(/[^\d.-]/g, "")) : previous

    if (prev === 0) {
      return { value: curr, percentage: curr > 0 ? 100 : 0 }
    }

    const change = curr - prev
    const percentage = (change / prev) * 100

    return { value: change, percentage }
  }, [])

  // Couleurs différentes pour chaque métrique (période actuelle vs précédente)
  const metricColors = [
    {
      current: "text-blue-600 dark:text-blue-400",
      previous: "text-blue-300 dark:text-blue-600",
      currentHex: "#3b82f6", // Bleu
      previousHex: "#93c5fd", // Bleu clair
    },
    {
      current: "text-green-600 dark:text-green-400",
      previous: "text-green-300 dark:text-green-600",
      currentHex: "#16a34a", // Vert
      previousHex: "#86efac", // Vert clair
    },
    {
      current: "text-purple-600 dark:text-purple-400",
      previous: "text-purple-300 dark:text-purple-600",
      currentHex: "#9333ea", // Violet
      previousHex: "#c084fc", // Violet clair
    },
    {
      current: "text-orange-600 dark:text-orange-400",
      previous: "text-orange-300 dark:text-orange-600",
      currentHex: "#ea580c", // Orange
      previousHex: "#fdba74", // Orange clair
    },
    {
      current: "text-pink-600 dark:text-pink-400",
      previous: "text-pink-300 dark:text-pink-600",
      currentHex: "#db2777", // Rose
      previousHex: "#f9a8d4", // Rose clair
    },
  ];

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
      {
        label: t('dashboard.comparison.metrics.inactive_users'),
        current: statsData.inactiveUsersCurrentPeriod || 0,
        previous: statsData.inactiveUsersPreviousPeriod || 0,
        format: "number",
      },
    ];
  }, [statsData, t]);

  // Préparer les données pour le graphique avec couleurs par métrique
  const chartData = useMemo(() => {
    if (!metrics || metrics.length === 0) return [];
    
    return metrics.map((metric, index) => {
      const currentNum = typeof metric.current === "string" ? parseFloat(metric.current.replace(/[^\d.-]/g, "")) : metric.current
      const previousNum = typeof metric.previous === "string" ? parseFloat(metric.previous.replace(/[^\d.-]/g, "")) : metric.previous
      const { percentage } = calculateChange(currentNum, previousNum)
      const colors = metricColors[index % metricColors.length]
      
      return {
        name: metric.label,
        current: currentNum,
        previous: previousNum,
        change: percentage,
        currentColor: colors.currentHex,
        previousColor: colors.previousHex,
      }
    })
  }, [metrics, calculateChange])

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
        <ChartContainer
          config={{}}
          className="h-[400px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-transparent [&_.recharts-tooltip-cursor]:fill-transparent"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent 
                  formatter={(value: any, name: string, props: any) => {
                    const metric = metrics.find(m => {
                      const label = m.label
                      return chartData.find(d => d.name === label)?.name === props.payload?.name
                    })
                    if (metric) {
                      return formatValue(value, metric.format, metric.unit)
                    }
                    return value
                  }}
                />}
                cursor={false}
              />
              <Legend 
                formatter={(value) => {
                  if (value === 'current') {
                    return t('dashboard.comparison.current_period') || "Période actuelle"
                  }
                  if (value === 'previous') {
                    return t('dashboard.comparison.previous_period') || "Période précédente"
                  }
                  return value
                }}
              />
              <Bar 
                dataKey="current" 
                name="current"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => {
                  if (index === chartData.length - 1) {
                    return <Cell key={`cell-current-${index}`} fill="orange" />;
                  }
                  const colors = metricColors[index % metricColors.length]
                  return (
                    <Cell key={`cell-current-${index}`} fill={colors.currentHex} />
                  )
                })}
              </Bar>
              <Bar 
                dataKey="previous" 
                name="previous"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => {
                  if (index === chartData.length - 1) {
                    return <Cell key={`cell-previous-${index}`} fill="gray" />;
                  }
                  const colors = metricColors[index % metricColors.length]
                  return (
                    <Cell key={`cell-previous-${index}`} fill={colors.previousHex} />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Affichage des détails avec indicateurs de changement */}
        <div className="mt-6 space-y-3">
          {metrics.map((metric, index) => {
            const currentNum = typeof metric.current === "string" ? parseFloat(metric.current.replace(/[^\d.-]/g, "")) : metric.current
            const previousNum = typeof metric.previous === "string" ? parseFloat(metric.previous.replace(/[^\d.-]/g, "")) : metric.previous
            const { value: changeValue, percentage } = calculateChange(currentNum, previousNum)
            const isPositive = percentage > 0
            const isNeutral = percentage === 0

            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex-1">
                  <p className="text-sm font-medium">{metric.label}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('dashboard.comparison.current_period') || "Actuel"}</p>
                    <p className={cn("text-lg font-bold", metricColors[index % metricColors.length].current)}>
                      {formatValue(currentNum, metric.format, metric.unit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('dashboard.comparison.previous_period') || "Précédent"}</p>
                    <p className={cn("text-lg font-bold", metricColors[index % metricColors.length].previous)}>
                      {formatValue(previousNum, metric.format, metric.unit)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[80px]">
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