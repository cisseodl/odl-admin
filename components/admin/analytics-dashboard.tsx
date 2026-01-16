"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoursePerformance } from "./course-performance"
import { UserGrowthChart } from "./user-growth-chart"
import { StatCard } from "@/components/shared/stat-card"
import { ReportCard } from "@/components/admin/reports/report-card"
import { LearnerProgressList } from "./learner-progress-list" // Import the new component
import {
  TrendingUp,
  GraduationCap,
  Clock,
  Star,
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Printer, // Import Printer icon
  Download, // Import Download icon
} from "lucide-react"
import { Button } from "@/components/ui/button" // Import Button component
import { useEffect, useState, useMemo } from "react" // Import hooks
import { analyticsService, type AnalyticsMetrics, type LearningTimeMetrics, type OverallComparisonStats, type UserGrowthDataPoint, type CoursePerformanceDataPoint } from "@/services/analytics.service" // Import service
import { PageLoader } from "@/components/ui/page-loader" // Import PageLoader
import { useLanguage } from "@/contexts/language-context" // Import useLanguage
import { downloadCSV, exportStatisticsToCSV } from "@/lib/csv-export" // Import CSV export utilities
import { useToast } from "@/hooks/use-toast" // Import useToast

export function AnalyticsDashboard() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [analyticsMetricsData, setAnalyticsMetricsData] = useState<AnalyticsMetrics | null>(null)
  const [learningTimeMetrics, setLearningTimeMetrics] = useState<LearningTimeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchAnalyticsMetrics = async () => {
      setLoading(true)
      setError(null)
      try {
        const [analyticsData, learningTimeData] = await Promise.all([
          analyticsService.getAnalyticsMetrics(),
          analyticsService.getLearningTimeMetrics()
        ])
        setAnalyticsMetricsData(analyticsData)
        setLearningTimeMetrics(learningTimeData)
      } catch (err: any) {
        setError(err.message || "Impossible de charger les métriques analytics.")
        console.error("Error fetching analytics metrics:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalyticsMetrics()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      // Récupérer toutes les données nécessaires pour l'export
      const [
        comparisonStats,
        userGrowthData,
        coursePerformanceData,
      ] = await Promise.all([
        analyticsService.getComparisonStats(),
        analyticsService.getUserGrowthData("6-months"),
        analyticsService.getCoursePerformanceData("30d"),
      ])

      // Préparer les sections CSV
      const sections = []

      // Section 1: Métriques Analytics
      if (analyticsMetricsData) {
        sections.push({
          title: t('analytics.export.sections.analytics_metrics') || "Métriques Analytics",
          data: [
            {
              [t('analytics.averageRating') || 'Note moyenne']: `${analyticsMetricsData.averageRating.toFixed(2)}/5`,
              [t('analytics.export.totalReviews') || 'Total avis']: analyticsMetricsData.totalReviews,
              [t('analytics.engagementRate') || 'Taux d\'engagement']: `${analyticsMetricsData.engagementRate.toFixed(2)}%`,
              [t('analytics.activeUsers') || 'Utilisateurs actifs']: analyticsMetricsData.activeUsers,
              [t('analytics.inactiveUsers') || 'Utilisateurs inactifs']: analyticsMetricsData.inactiveUsers || 0,
              [t('analytics.totalUsers') || 'Total utilisateurs']: analyticsMetricsData.totalUsers,
              [t('analytics.export.averageSessionTimeMinutes') || 'Temps moyen de session (min)']: analyticsMetricsData.averageSessionTimeMinutes.toFixed(2),
              [t('analytics.activeSessions') || 'Sessions actives']: analyticsMetricsData.activeSessions,
              [t('analytics.export.interactionRate') || 'Taux d\'interaction']: `${analyticsMetricsData.interactionRate.toFixed(2)}%`,
            },
          ],
        })
      }

      // Section 2: Statistiques de comparaison
      sections.push({
        title: t('analytics.export.sections.comparison_stats') || "Statistiques de Comparaison",
        data: [
          {
            [t('dashboard.comparison.metrics.registrations') || 'Inscriptions']: `${comparisonStats.registrationsCurrentPeriod} (${comparisonStats.registrationsPreviousPeriod})`,
            [t('dashboard.comparison.metrics.completion_rate') || 'Taux de complétion']: `${comparisonStats.completionRateCurrentPeriod.toFixed(2)}% (${comparisonStats.completionRatePreviousPeriod.toFixed(2)}%)`,
            [t('dashboard.comparison.metrics.courses_created') || 'Cours créés']: `${comparisonStats.coursesCreatedCurrentPeriod} (${comparisonStats.coursesCreatedPreviousPeriod})`,
            [t('dashboard.comparison.metrics.active_users') || 'Utilisateurs actifs']: `${comparisonStats.activeUsersCurrentPeriod} (${comparisonStats.activeUsersPreviousPeriod})`,
            [t('dashboard.comparison.metrics.inactive_users') || 'Utilisateurs inactifs']: `${comparisonStats.inactiveUsersCurrentPeriod} (${comparisonStats.inactiveUsersPreviousPeriod})`,
          },
        ],
      })

      // Section 3: Métriques de temps d'apprentissage
      if (learningTimeMetrics) {
        sections.push({
          title: t('analytics.export.sections.learning_time') || "Métriques de Temps d'Apprentissage",
          data: [
            {
              [t('analytics.learning_time.average_time_per_course') || 'Temps moyen par cours (min)']: Math.round(learningTimeMetrics.averageTimePerCourseMinutes),
              [t('analytics.learning_time.active_sessions') || 'Sessions actives']: learningTimeMetrics.activeSessions,
              [t('analytics.learning_time.average_time_per_learner') || 'Temps moyen par apprenant (min)']: Math.round(learningTimeMetrics.averageTimePerLearnerMinutes),
              [t('analytics.learning_time.courses_with_activity') || 'Cours avec activité']: learningTimeMetrics.coursesWithActivity,
              [t('analytics.learning_time.active_learners') || 'Apprenants actifs']: learningTimeMetrics.learnersWithActivity,
            },
          ],
        })
      }

      // Section 4: Croissance des utilisateurs
      if (userGrowthData && userGrowthData.length > 0) {
        sections.push({
          title: t('analytics.export.sections.user_growth') || "Croissance des Utilisateurs",
          data: userGrowthData.map((point) => ({
            [t('analytics.export.date') || 'Date']: point.date,
            [t('analytics.charts.user_growth.new_users') || 'Nouveaux utilisateurs']: point.newUsers,
            [t('analytics.charts.user_growth.total_cumulative') || 'Total utilisateurs']: point.totalUsers,
          })),
        })
      }

      // Section 5: Performance des cours
      if (coursePerformanceData && coursePerformanceData.length > 0) {
        sections.push({
          title: t('analytics.export.sections.course_performance') || "Performance des Cours",
          data: coursePerformanceData.map((point) => ({
            [t('analytics.export.courseTitle') || 'Titre du cours']: point.courseTitle,
            [t('analytics.export.enrollments') || 'Inscriptions']: point.enrollments,
            [t('analytics.export.completionRate') || 'Taux de complétion (%)']: point.completionRate.toFixed(2),
            [t('analytics.export.averageRating') || 'Note moyenne']: point.averageRating.toFixed(2),
            [t('analytics.export.period') || 'Période']: point.period,
          })),
        })
      }

      // Générer le CSV
      const csvContent = exportStatisticsToCSV(sections)

      // Télécharger le fichier
      const timestamp = new Date().toISOString().split('T')[0]
      downloadCSV(csvContent, `statistiques-analytics-${timestamp}`)

      toast({
        title: t('analytics.export.success.title') || "Export réussi",
        description: t('analytics.export.success.description') || "Les statistiques ont été exportées en CSV",
      })
    } catch (err: any) {
      console.error("Error exporting CSV:", err)
      toast({
        title: t('analytics.export.error.title') || "Erreur d'export",
        description: err.message || t('analytics.export.error.description') || "Impossible d'exporter les statistiques",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  // Métriques spécifiques à l'analytics (dynamiques depuis le backend)
  const analyticsMetrics = useMemo(() => {
    if (!analyticsMetricsData) return []
    return [
      {
        title: t("analytics.averageRating"),
        value: `${analyticsMetricsData.averageRating.toFixed(1)}/5`,
        change: `${analyticsMetricsData.totalReviews.toLocaleString("fr-FR")} ${t("common.reviews") || "avis"}`,
        icon: Star,
        color: "text-[hsl(var(--warning))]",
      },
      {
        title: t("analytics.engagementRate"),
        value: `${analyticsMetricsData.engagementRate.toFixed(1)}%`,
        change: `${analyticsMetricsData.activeUsers.toLocaleString("fr-FR")} ${t("analytics.activeUsers")} / ${analyticsMetricsData.inactiveUsers?.toLocaleString("fr-FR") || 0} ${t("analytics.inactiveUsers") || "Inactifs"} / ${analyticsMetricsData.totalUsers.toLocaleString("fr-FR")} ${t("analytics.totalUsers")}`,
        icon: TrendingUp,
        color: "text-[hsl(var(--warning))]",
      },
    ]
  }, [analyticsMetricsData, t])

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 mb-4 no-print">
        <Button onClick={handleExportCSV} disabled={exporting || loading} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {exporting ? (t('analytics.export.exporting') || "Export en cours...") : (t('analytics.export.button') || "Exporter en CSV")}
        </Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          {t('analytics.print_button')}
        </Button>
      </div>

      {/* Métriques Analytics - Spécifiques à cette page */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="text-center text-destructive p-4">{error}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold leading-tight">{t("analytics.kpi")}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {t("analytics.title")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {analyticsMetrics.map((metric) => (
                <StatCard
                  key={metric.title}
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  icon={metric.icon}
                  color={metric.color}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphiques principaux */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UserGrowthChart />
        <CoursePerformance timeFilter="30d" />
      </div>

      {/* Onglets pour analyses détaillées */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
          <TabsTrigger
            value="learners"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            {t('analytics.tabs.learners')}
          </TabsTrigger>
          <TabsTrigger
            value="learning-time"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            {t('analytics.tabs.learning_time')}
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            {t('analytics.tabs.reports')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="learners">
          <LearnerProgressList />
        </TabsContent>

        <TabsContent value="learning-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold leading-tight">{t('analytics.learning_time.title')}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {t('analytics.learning_time.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <PageLoader />
              ) : error ? (
                <div className="text-center text-destructive p-4">{error}</div>
              ) : learningTimeMetrics ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-6 rounded-lg border shadow-sm bg-card">
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{t('analytics.learning_time.average_time_per_course')}</p>
                    <p className="text-3xl font-bold leading-tight">{Math.round(learningTimeMetrics.averageTimePerCourseMinutes)} min</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('analytics.learning_time.courses_with_activity', { count: learningTimeMetrics.coursesWithActivity })}
                    </p>
                  </div>
                  <div className="p-6 rounded-lg border shadow-sm bg-card">
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{t('analytics.learning_time.active_sessions')}</p>
                    <p className="text-3xl font-bold leading-tight">{learningTimeMetrics.activeSessions.toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-muted-foreground mt-2">{t('analytics.learning_time.last_24_hours')}</p>
                  </div>
                  <div className="p-6 rounded-lg border shadow-sm bg-card">
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{t('analytics.learning_time.average_time_per_learner')}</p>
                    <p className="text-3xl font-bold leading-tight">{Math.round(learningTimeMetrics.averageTimePerLearnerMinutes)} min</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('analytics.learning_time.active_learners', { count: learningTimeMetrics.learnersWithActivity })}
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold leading-tight flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('analytics.reports.title')}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {t('analytics.reports.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  reportType={{
                    id: "learning-time",
                    title: t('analytics.reports.learning_time.title'),
                    description: t('analytics.reports.learning_time.description'),
                    icon: Clock,
                    color: "text-[hsl(var(--chart-1))]",
                  }}
                />
                <ReportCard
                  reportType={{
                    id: "users",
                    title: t('analytics.reports.users.title'),
                    description: t('analytics.reports.users.description'),
                    icon: Users,
                    color: "text-[hsl(var(--chart-2))]",
                  }}
                />
                <ReportCard
                  reportType={{
                    id: "courses",
                    title: t('analytics.reports.courses.title'),
                    description: t('analytics.reports.courses.description'),
                    icon: BookOpen,
                    color: "text-[hsl(var(--chart-3))]",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
