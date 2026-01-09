"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, RefreshCw, Users, BookOpen, BarChart3, TrendingUp, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DashboardStats, type StatItem } from "@/components/admin/dashboard-stats"
import { ComparisonStats } from "@/components/admin/comparison-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"

import { analyticsService, type AdminDashboardAnalytics } from "@/services/analytics.service";
import { UsersByRoleChart } from "./users-by-role-chart"
import { TopCoursesChart } from "./top-courses-chart"

type TimeFilter = "7d" | "30d" | "90d" | "custom" | "all"

export function DashboardEnhanced() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [overviewData, setOverviewData] = useState<AdminDashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getAdminDashboardAnalytics(); // Corrected method call
      setOverviewData(data);
    } catch (err) {
      setError("Impossible de charger les données du tableau de bord.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOverview();
    setIsRefreshing(false);
  };
  
  const mainStats = useMemo((): StatItem[] => {
    if (!overviewData) return [];
    return [
      { title: "Nouveaux utilisateurs (30j)", value: overviewData.newUsersLast30Days.toLocaleString("fr-FR"), icon: Users, color: "text-primary" },
      { title: "Nouveaux cours (30j)", value: overviewData.newCoursesLast30Days.toLocaleString("fr-FR"), icon: BookOpen, color: "text-primary" },
      { title: "Inscriptions totales", value: overviewData.totalEnrollments.toLocaleString("fr-FR"), icon: TrendingUp, color: "text-primary" },
      { title: "Leçons terminées", value: overviewData.lessonsCompleted.toLocaleString("fr-FR"), icon: CheckCircle, color: "text-primary" },
    ];
  }, [overviewData]);

  const globalStats = useMemo((): StatItem[] => {
    if (!overviewData) return [];
    return [
        { title: "Total Utilisateurs", value: overviewData.totalUsers.toLocaleString("fr-FR"), icon: Users, color: "text-blue-500" },
        { title: "Total Cours", value: overviewData.totalCourses.toLocaleString("fr-FR"), icon: BookOpen, color: "text-green-500" },
        { title: "Cours publiés", value: overviewData.publishedCourses.toLocaleString("fr-FR"), icon: CheckCircle, color: "text-green-500" },
        { title: "En attente", value: overviewData.pendingModeration.toLocaleString("fr-FR"), icon: BarChart3, color: "text-yellow-500" },
    ];
  }, [overviewData]);

  const getDateRange = useMemo(() => {
    const now = new Date()
    switch (timeFilter) {
      case "7d": return { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
      case "30d": return { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
      case "90d": return { start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), end: now };
      case "custom": return { start: customStartDate, end: customEndDate };
      default: return { start: undefined, end: undefined };
    }
  }, [timeFilter, customStartDate, customEndDate]);

  const dateRange = getDateRange;

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
          {/* Les filtres peuvent être réactivés pour interagir avec les services plus tard */}
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats principales */}
      <DashboardStats stats={mainStats} loading={isLoading} />

      {/* Titre pour les stats globales */}
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-2xl font-bold tracking-tight">Statistiques Globales</h2>
      </div>

      {/* Stats globales */}
      <DashboardStats stats={globalStats} loading={isLoading} />

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {overviewData?.usersByRole ? <UsersByRoleChart data={overviewData.usersByRole} /> : null}
        {overviewData?.top5CoursesByEnrollment ? <TopCoursesChart data={overviewData.top5CoursesByEnrollment} /> : null}
      </div>
      
      {/* Actions rapides */}
      <QuickActions />

      {/* Comparaisons (pourrait être alimenté par un autre service plus tard) */}
      <ComparisonStats
        title="Comparaison Mois Actuel vs Précédent"
        description="Analyse comparative des performances"
        // period="month" // Removed
        // timeFilter={timeFilter} // Removed
      />

      {/* Activité récente */}
      <RecentActivity limit={5} />


    </div>
  )
}

