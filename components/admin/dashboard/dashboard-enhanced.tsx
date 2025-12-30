"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, Download, RefreshCw, Users, BookOpen, BarChart3, Award } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DashboardStats, type StatItem } from "@/components/admin/dashboard-stats"
import { UserGrowthChart } from "@/components/admin/user-growth-chart"
import { CoursePerformance } from "@/components/admin/course-performance"
import { ComparisonStats } from "@/components/admin/comparison-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"
import { PendingModerationAlerts } from "@/components/admin/pending-moderation-alerts"
import { analyticsService } from "@/services/analytics.service"

type TimeFilter = "7d" | "30d" | "90d" | "custom" | "all"

export function DashboardEnhanced() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [stats, setStats] = useState<StatItem[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  const fetchDashboardStats = async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const summary = await analyticsService.getDashboardSummary()
      const formattedStats: StatItem[] = [
        {
          title: "Utilisateurs Totaux",
          value: summary.totalUsers.toLocaleString("fr-FR"),
          icon: Users,
          color: "text-primary",
        },
        {
          title: "Formations Totales",
          value: summary.totalCourses.toLocaleString("fr-FR"),
          icon: BookOpen,
          color: "text-primary",
        },
        {
          title: "Tentatives de Quiz",
          value: summary.totalQuizAttemptsGlobal.toLocaleString("fr-FR"),
          icon: BarChart3,
          color: "text-primary",
        },
        {
          title: "Certificats Obtenus",
          value: summary.totalCertificatesGlobal.toLocaleString("fr-FR"),
          icon: Award,
          color: "text-primary",
        },
      ]
      setStats(formattedStats)
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error)
      setStatsError("Impossible de charger les statistiques.")
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardStats()
    setIsRefreshing(false)
  }

  const getDateRange = useMemo(() => {
    const now = new Date()
    switch (timeFilter) {
      case "7d":
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
        }
      case "30d":
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
        }
      case "90d":
        return {
          start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now,
        }
      case "custom":
        return {
          start: customStartDate,
          end: customEndDate,
        }
      default:
        return {
          start: undefined,
          end: undefined,
        }
    }
  }, [timeFilter, customStartDate, customEndDate])

  const dateRange = getDateRange

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight text-balance">Tableau de bord</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Vue d'ensemble de votre plateforme de formation
            {dateRange.start && dateRange.end && (
              <span className="ml-2">
                ({format(dateRange.start, "d MMM")} - {format(dateRange.end, "d MMM yyyy")})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="custom">Période personnalisée</SelectItem>
              <SelectItem value="all">Toutes les périodes</SelectItem>
            </SelectContent>
          </Select>

          {timeFilter === "custom" && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "PPP") : "Date de début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                    initialFocus
                    toDate={customEndDate}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "PPP") : "Date de fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                    initialFocus
                    fromDate={customStartDate}
                  />
                </PopoverContent>
              </Popover>
            </>
          )}

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats principales */}
      <DashboardStats stats={stats} loading={statsLoading} />

      {/* Actions rapides */}
      <QuickActions />

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UserGrowthChart />
        <CoursePerformance />
      </div>

      {/* Comparaisons */}
      <ComparisonStats
        title="Comparaison Mois Actuel vs Précédent"
        description="Analyse comparative des performances"
        period="month"
        metrics={[
          {
            label: "Inscriptions",
            current: 1234,
            previous: 1043,
            format: "number",
          },
          {
            label: "Taux de complétion",
            current: 68.4,
            previous: 63.1,
            format: "percentage",
          },
          {
            label: "Formations créées",
            current: 256,
            previous: 234,
            format: "number",
          },
          {
            label: "Utilisateurs actifs",
            current: 12543,
            previous: 11120,
            format: "number",
          },
        ]}
      />

      {/* Activité récente */}
      <RecentActivity />

      {/* Alertes de modération */}
      <PendingModerationAlerts />
    </div>
  )
}

