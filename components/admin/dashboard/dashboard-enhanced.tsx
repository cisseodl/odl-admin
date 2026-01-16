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
import { useLanguage } from "@/contexts/language-context"

type TimeFilter = "7d" | "30d" | "90d" | "custom" | "all"

export function DashboardEnhanced() {
  const { t } = useLanguage();
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
      setError(t('dashboard.loadError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

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
      { title: t('dashboard.mainStats.newUsers'), value: overviewData.newUsersLast30Days.toLocaleString("fr-FR"), icon: Users, color: "text-primary" },
      { title: t('dashboard.mainStats.newCourses'), value: overviewData.newCoursesLast30Days.toLocaleString("fr-FR"), icon: BookOpen, color: "text-primary" },
      { title: t('dashboard.mainStats.totalEnrollments'), value: overviewData.totalEnrollments.toLocaleString("fr-FR"), icon: TrendingUp, color: "text-primary" },
      { title: t('dashboard.mainStats.lessonsCompleted'), value: overviewData.lessonsCompleted.toLocaleString("fr-FR"), icon: CheckCircle, color: "text-primary" },
    ];
  }, [overviewData, t]);

  const globalStats = useMemo((): StatItem[] => {
    if (!overviewData) return [];
    return [
        { title: t('dashboard.globalStats.totalUsers'), value: overviewData.totalUsers.toLocaleString("fr-FR"), icon: Users, color: "text-blue-500" },
        { title: t('dashboard.globalStats.totalCourses'), value: overviewData.totalCourses.toLocaleString("fr-FR"), icon: BookOpen, color: "text-green-500" },
        { title: t('dashboard.globalStats.publishedCourses'), value: overviewData.publishedCourses.toLocaleString("fr-FR"), icon: CheckCircle, color: "text-green-500" },
        { title: t('dashboard.globalStats.pendingModeration'), value: overviewData.pendingModeration.toLocaleString("fr-FR"), icon: BarChart3, color: "text-yellow-500" },
    ];
  }, [overviewData, t]);

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
          <h1 className="text-3xl font-bold tracking-tight leading-tight text-balance">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {t('dashboard.description')}
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

      {/* Actions rapides */}
      <QuickActions />

      {/* Stats principales */}
      <DashboardStats stats={mainStats} loading={isLoading} />

      {/* Titre pour les stats globales */}
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('dashboard.globalStats.title')}</h2>
      </div>

      {/* Stats globales */}
      <DashboardStats stats={globalStats} loading={isLoading} />

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {overviewData?.usersByRole ? <UsersByRoleChart data={overviewData.usersByRole} /> : null}
        {overviewData?.top5CoursesByEnrollment ? <TopCoursesChart data={overviewData.top5CoursesByEnrollment} /> : null}
      </div>

      {/* Comparaisons (pourrait être alimenté par un autre service plus tard) */}
      <ComparisonStats
        title={t('dashboard.comparison.title')}
        description={t('dashboard.comparison.description')}
        // period="month" // Removed
        // timeFilter={timeFilter} // Removed
      />

      {/* Activité recente */}
      <RecentActivity limit={5} />


    </div>
  )
}

