"use client"

import { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Dot } from "recharts"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { analyticsService, UserGrowthDataPoint } from "@/services/analytics.service"
import { PageLoader } from "@/components/ui/page-loader"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { fr } from "date-fns/locale"

type TimeFilter = "week" | "month" | "year"

interface EnrollmentDataPoint {
  day: string // Abréviation du jour (Mar, Mer, etc.)
  dayFull: string // Nom complet du jour
  date: Date
  enrollments: number
}

export function EnrollmentProgressionChart() {
  const { t } = useLanguage()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week")
  const [data, setData] = useState<EnrollmentDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  // Générer les jours de la semaine pour l'axe X
  const getWeekDays = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Lundi
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    return days.map(day => ({
      day: format(day, "EEE", { locale: fr }), // Abréviation (Mar, Mer, etc.)
      dayFull: format(day, "EEEE", { locale: fr }), // Nom complet
      date: day,
    }))
  }, [])

  // Récupérer les données selon le filtre de temps
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        let timeframe = "7-days"
        let startDate: Date
        let endDate: Date = new Date()
        
        if (timeFilter === "week") {
          timeframe = "7-days"
          startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
          endDate = endOfWeek(new Date(), { weekStartsOn: 1 })
        } else if (timeFilter === "month") {
          timeframe = "30-days"
          startDate = startOfMonth(new Date())
          endDate = endOfMonth(new Date())
        } else {
          timeframe = "1-year"
          startDate = startOfYear(new Date())
          endDate = endOfYear(new Date())
        }

        const result = await analyticsService.getUserGrowthData(timeframe)
        
        // Transformer les données selon le filtre
        const enrollmentMap = new Map<string, number>()
        
        result.forEach((point: UserGrowthDataPoint) => {
          try {
            let pointDate: Date
            // Gérer les différents formats de date
            if (point.date.includes('-') && point.date.length === 10) {
              pointDate = new Date(point.date)
            } else if (point.date.includes('-') && point.date.length === 7) {
              pointDate = new Date(point.date + '-01')
            } else {
              pointDate = new Date(point.date)
            }
            
            // Vérifier si la date est dans la période sélectionnée
            if (pointDate >= startDate && pointDate <= endDate) {
              let dayKey: string
              if (timeFilter === "week") {
                dayKey = format(pointDate, "EEE", { locale: fr })
              } else if (timeFilter === "month") {
                dayKey = format(pointDate, "dd/MM", { locale: fr })
              } else { // year
                dayKey = format(pointDate, "MMM", { locale: fr })
              }
              const currentCount = enrollmentMap.get(dayKey) || 0
              enrollmentMap.set(dayKey, currentCount + (point.newUsers || 0))
            }
          } catch (e) {
            console.warn("Error parsing date:", point.date, e)
          }
        })

        // Créer les données selon le filtre
        let chartData: EnrollmentDataPoint[] = []
        if (timeFilter === "week") {
          chartData = getWeekDays.map(({ day, dayFull, date }) => ({
            day,
            dayFull,
            date,
            enrollments: enrollmentMap.get(day) || 0,
          }))
        } else if (timeFilter === "month") {
          const daysInMonth = Array.from({ length: endDate.getDate() }, (_, i) => {
            const d = new Date(startDate)
            d.setDate(i + 1)
            return d
          })
          chartData = daysInMonth.map((date) => ({
            day: format(date, "dd/MM", { locale: fr }),
            dayFull: format(date, "EEEE dd MMMM", { locale: fr }),
            date,
            enrollments: enrollmentMap.get(format(date, "dd/MM", { locale: fr })) || 0,
          }))
        } else { // year
          const monthsInYear = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(startDate)
            d.setMonth(i)
            return d
          })
          chartData = monthsInYear.map((date) => ({
            day: format(date, "MMM", { locale: fr }),
            dayFull: format(date, "MMMM yyyy", { locale: fr }),
            date,
            enrollments: enrollmentMap.get(format(date, "MMM", { locale: fr })) || 0,
          }))
        }

        setData(chartData)
      } catch (err: any) {
        setError(err.message || "Impossible de charger les données d'inscription.")
        console.error("Error fetching enrollment data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeFilter, getWeekDays])

  const maxEnrollments = useMemo(() => {
    if (data.length === 0) return 2
    const max = Math.max(...data.map((d) => d.enrollments))
    // Arrondir à la valeur supérieure pour avoir un axe Y propre
    return Math.ceil(max / 0.5) * 0.5 || 2
  }, [data])

  // Générer les ticks pour l'axe Y (0, 0.5, 1, 1.5, 2, etc.)
  const yAxisTicks = useMemo(() => {
    const ticks: number[] = []
    for (let i = 0; i <= maxEnrollments; i += 0.5) {
      ticks.push(i)
    }
    return ticks
  }, [maxEnrollments])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Nombre d'inscrits</CardTitle>
              <CardDescription>Suivez votre évolution dans le temps</CardDescription>
            </div>
          </div>
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
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Nombre d'inscrits</CardTitle>
              <CardDescription>Suivez votre évolution dans le temps</CardDescription>
            </div>
          </div>
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
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Nombre d'inscrits</CardTitle>
              <CardDescription>Suivez votre évolution dans le temps</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={timeFilter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("week")}
            >
              Semaine
            </Button>
            <Button
              variant={timeFilter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("month")}
            >
              Mois
            </Button>
            <Button
              variant={timeFilter === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("year")}
            >
              Année
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex justify-center items-center h-[400px] text-muted-foreground">
            Aucune donnée disponible pour la période sélectionnée
          </div>
        ) : (
          <ChartContainer
            config={{
              enrollments: {
                label: "Nombre d'inscrits",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                onMouseMove={(e: any) => {
                  if (e?.activePayload?.[0]?.payload) {
                    setSelectedDay(e.activePayload[0].payload.day)
                  }
                }}
                onMouseLeave={() => setSelectedDay(null)}
              >
                <defs>
                  <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  domain={[0, maxEnrollments]}
                  ticks={yAxisTicks}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as EnrollmentDataPoint
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="font-semibold mb-2">{data.dayFull}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Nombre d'inscrits:</span>
                            <span className="font-bold text-primary">{data.enrollments}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#colorEnrollments)"
                  dot={(props: any) => {
                    const isSelected = selectedDay === props.payload.day
                    return (
                      <Dot
                        {...props}
                        r={isSelected ? 5 : 3}
                        fill={isSelected ? "hsl(var(--chart-1))" : "hsl(var(--chart-1))"}
                        stroke={isSelected ? "hsl(var(--background))" : "none"}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    )
                  }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
