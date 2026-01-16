"use client"

import { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { analyticsService, UserGrowthDataPoint } from "@/services/analytics.service"
import { PageLoader } from "@/components/ui/page-loader"
import { downloadCSV, convertToCSV } from "@/lib/csv-export"
import { useToast } from "@/hooks/use-toast"

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

export function KPILearnerGrowthChart() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [data, setData] = useState<UserGrowthDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
    to: new Date(),
  })
  const [exporting, setExporting] = useState(false)

  // Formater les données pour le graphique horizontal
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Filtrer et trier par date
    return data
      .filter((point) => {
        if (!dateRange.from || !dateRange.to) return true
        try {
          // Gérer les formats de date différents (yyyy-MM-dd pour jours, yyyy-MM pour mois)
          let pointDate: Date
          if (point.date.includes('-') && point.date.length === 10) {
            // Format yyyy-MM-dd
            pointDate = new Date(point.date)
          } else if (point.date.includes('-') && point.date.length === 7) {
            // Format yyyy-MM (premier jour du mois)
            pointDate = new Date(point.date + '-01')
          } else {
            // Format inconnu, inclure par défaut
            return true
          }
          return pointDate >= dateRange.from && pointDate <= dateRange.to
        } catch (e) {
          // En cas d'erreur de parsing, inclure le point par défaut
          return true
        }
      })
      .map((point) => {
        try {
          // Formater la date selon son format
          let formattedDate: string
          let dateForSort: Date
          
          if (point.date.includes('-') && point.date.length === 10) {
            // Format yyyy-MM-dd
            dateForSort = new Date(point.date)
            formattedDate = format(dateForSort, "dd/MM/yyyy")
          } else if (point.date.includes('-') && point.date.length === 7) {
            // Format yyyy-MM
            dateForSort = new Date(point.date + '-01')
            formattedDate = format(dateForSort, "MM/yyyy")
          } else {
            // Format inconnu, utiliser tel quel
            formattedDate = point.date
            dateForSort = new Date()
          }
          
          return {
            date: formattedDate,
            dateRaw: point.date,
            learners: point.newUsers || 0, // Utiliser newUsers comme apprenants inscrits
          }
        } catch (e) {
          // En cas d'erreur, retourner un format par défaut
          return {
            date: point.date,
            dateRaw: point.date,
            learners: point.newUsers || 0,
          }
        }
      })
      .sort((a, b) => {
        try {
          // Trier par date en gérant les différents formats
          const dateA = a.dateRaw.includes('-') && a.dateRaw.length === 10
            ? new Date(a.dateRaw)
            : a.dateRaw.includes('-') && a.dateRaw.length === 7
            ? new Date(a.dateRaw + '-01')
            : new Date()
          const dateB = b.dateRaw.includes('-') && b.dateRaw.length === 10
            ? new Date(b.dateRaw)
            : b.dateRaw.includes('-') && b.dateRaw.length === 7
            ? new Date(b.dateRaw + '-01')
            : new Date()
          return dateA.getTime() - dateB.getTime()
        } catch (e) {
          return 0
        }
      })
  }, [data, dateRange])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Récupérer les données avec un timeframe adapté
        const daysDiff = dateRange.from && dateRange.to
          ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
          : 30

        let timeframe = "6-months" // Par défaut pour avoir assez de données
        if (daysDiff <= 7) timeframe = "7-days"
        else if (daysDiff <= 90) timeframe = "3-months"
        else if (daysDiff <= 180) timeframe = "6-months"
        else timeframe = "1-year"

        const result = await analyticsService.getUserGrowthData(timeframe)
        setData(result)
      } catch (err: any) {
        setError(err.message || "Impossible de charger les données de croissance des apprenants.")
        console.error("Error fetching learner growth data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dateRange.from, dateRange.to])

  const handleExportCSV = () => {
    if (chartData.length === 0) {
      toast({
        title: t('analytics.export.error.title') || "Erreur d'export",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      })
      return
    }

    setExporting(true)
    try {
      const csvData = chartData.map((point) => ({
        [t('analytics.kpi_chart.date') || 'Date']: point.date,
        [t('analytics.kpi_chart.learners_enrolled') || 'Apprenants inscrits']: point.learners,
      }))

      const csvContent = convertToCSV(csvData)
      const timestamp = new Date().toISOString().split('T')[0]
      downloadCSV(csvContent, `kpi-croissance-apprenants-${timestamp}`)

      toast({
        title: t('analytics.export.success.title') || "Export réussi",
        description: t('analytics.export.success.description') || "Les données ont été exportées en CSV",
      })
    } catch (err: any) {
      console.error("Error exporting CSV:", err)
      toast({
        title: t('analytics.export.error.title') || "Erreur d'export",
        description: err.message || t('analytics.export.error.description') || "Impossible d'exporter les données",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const maxLearners = useMemo(() => {
    return chartData.length > 0 ? Math.max(...chartData.map((d) => d.learners)) : 0
  }, [chartData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.kpi') || "KPI"}</CardTitle>
          <CardDescription>{t('analytics.kpi_chart.description') || "Croissance des apprenants inscrits"}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <PageLoader />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.kpi') || "KPI"}</CardTitle>
          <CardDescription>{t('analytics.kpi_chart.description') || "Croissance des apprenants inscrits"}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px] text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('analytics.kpi') || "KPI"}</CardTitle>
            <CardDescription>{t('analytics.kpi_chart.description') || "Croissance des apprenants inscrits par période"}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: fr })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: fr })
                    )
                  ) : (
                    <span>{t('analytics.kpi_chart.select_date') || "Sélectionner une période"}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    })
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleExportCSV} disabled={exporting || chartData.length === 0} variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex justify-center items-center h-[400px] text-muted-foreground">
            {t('analytics.kpi_chart.no_data') || "Aucune donnée disponible pour la période sélectionnée"}
          </div>
        ) : (
          <ChartContainer
            config={{
              learners: {
                label: t('analytics.kpi_chart.learners_enrolled') || "Apprenants inscrits",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorLearners" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-learners)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--color-learners)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  domain={[0, maxLearners * 1.1]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  label={{
                    value: t('analytics.kpi_chart.learners_enrolled') || "Apprenants inscrits",
                    position: "insideBottom",
                    offset: -5,
                    style: { textAnchor: "middle", fill: "hsl(var(--foreground))" },
                  }}
                />
                <YAxis
                  dataKey="date"
                  type="category"
                  width={110}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="font-semibold mb-2">{data.date}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
                            <span className="text-muted-foreground">
                              {t('analytics.kpi_chart.learners_enrolled') || "Apprenants inscrits"}:
                            </span>
                            <span className="font-bold">{data.learners.toLocaleString("fr-FR")}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                />
                <Bar
                  dataKey="learners"
                  fill="url(#colorLearners)"
                  radius={[0, 8, 8, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
