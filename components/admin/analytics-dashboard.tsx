"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoursePerformance } from "./course-performance"
import { UserGrowthChart } from "./user-growth-chart"
import { StatCard } from "@/components/shared/stat-card"
import { ReportCard } from "@/components/admin/reports/report-card"
import { LearnerProgressList } from "./learner-progress-list" // Import the new component
import { EnrollmentProgressionChart } from "./enrollment-progression-chart"
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
import { exportToExcel, type ExcelSheet } from "@/lib/excel-export" // Import Excel export utilities
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

      // Préparer les feuilles Excel
      const excelSheets: ExcelSheet[] = []

      // Feuille 1: Métriques Analytics
      if (analyticsMetricsData) {
        const engagementRate = analyticsMetricsData.totalUsers > 0 
          ? (analyticsMetricsData.activeUsers / analyticsMetricsData.totalUsers) * 100 
          : 0

        excelSheets.push({
          name: "Métriques Analytics",
          headers: [
            { key: "metric", label: "Métrique", width: 35 },
            { key: "value", label: "Valeur", width: 25 },
          ],
          data: [
            { metric: t('analytics.averageRating') || 'Note moyenne', value: `${analyticsMetricsData.averageRating.toFixed(2)}/5` },
            { metric: t('analytics.export.totalReviews') || 'Total avis', value: analyticsMetricsData.totalReviews },
            { metric: t('analytics.engagementRate') || 'Taux d\'engagement', value: `${engagementRate.toFixed(2)}%` },
            { metric: t('analytics.activeUsers') || 'Utilisateurs actifs', value: analyticsMetricsData.activeUsers },
            { metric: t('analytics.inactiveUsers') || 'Utilisateurs inactifs', value: analyticsMetricsData.inactiveUsers || 0 },
            { metric: t('analytics.totalUsers') || 'Total utilisateurs', value: analyticsMetricsData.totalUsers },
            { metric: t('analytics.export.averageSessionTimeMinutes') || 'Temps moyen de session (min)', value: analyticsMetricsData.averageSessionTimeMinutes.toFixed(2) },
            { metric: t('analytics.activeSessions') || 'Sessions actives', value: analyticsMetricsData.activeSessions },
            { metric: t('analytics.export.interactionRate') || 'Taux d\'interaction', value: `${analyticsMetricsData.interactionRate.toFixed(2)}%` },
          ],
        })
      }

      // Feuille 2: Statistiques de comparaison
      excelSheets.push({
        name: "Statistiques Comparaison",
        headers: [
          { key: "metric", label: "Métrique", width: 30 },
          { key: "mois_actuel", label: "Mois Actuel", width: 20 },
          { key: "mois_precedent", label: "Mois Précédent", width: 20 },
        ],
        data: [
          { 
            metric: t('dashboard.comparison.metrics.registrations') || 'Inscriptions',
            mois_actuel: comparisonStats.registrationsCurrentPeriod,
            mois_precedent: comparisonStats.registrationsPreviousPeriod,
          },
          { 
            metric: t('dashboard.comparison.metrics.completion_rate') || 'Taux de complétion',
            mois_actuel: `${comparisonStats.completionRateCurrentPeriod.toFixed(2)}%`,
            mois_precedent: `${comparisonStats.completionRatePreviousPeriod.toFixed(2)}%`,
          },
          { 
            metric: t('dashboard.comparison.metrics.courses_created') || 'Cours créés',
            mois_actuel: comparisonStats.coursesCreatedCurrentPeriod,
            mois_precedent: comparisonStats.coursesCreatedPreviousPeriod,
          },
          { 
            metric: t('dashboard.comparison.metrics.active_users') || 'Utilisateurs actifs',
            mois_actuel: comparisonStats.activeUsersCurrentPeriod,
            mois_precedent: comparisonStats.activeUsersPreviousPeriod,
          },
          { 
            metric: t('dashboard.comparison.metrics.inactive_users') || 'Utilisateurs inactifs',
            mois_actuel: comparisonStats.inactiveUsersCurrentPeriod,
            mois_precedent: comparisonStats.inactiveUsersPreviousPeriod,
          },
        ],
      })

      // Feuille 3: Métriques de temps d'apprentissage
      if (learningTimeMetrics) {
        excelSheets.push({
          name: "Temps d'Apprentissage",
          headers: [
            { key: "metric", label: "Métrique", width: 35 },
            { key: "value", label: "Valeur", width: 25 },
          ],
          data: [
            { metric: t('analytics.learning_time.average_time_per_course') || 'Temps moyen par cours (min)', value: Math.round(learningTimeMetrics.averageTimePerCourseMinutes) },
            { metric: t('analytics.learning_time.active_sessions') || 'Sessions actives', value: learningTimeMetrics.activeSessions },
            { metric: t('analytics.learning_time.average_time_per_learner') || 'Temps moyen par apprenant (min)', value: Math.round(learningTimeMetrics.averageTimePerLearnerMinutes) },
            { metric: t('analytics.learning_time.courses_with_activity') || 'Cours avec activité', value: learningTimeMetrics.coursesWithActivity },
            { metric: t('analytics.learning_time.active_learners') || 'Apprenants actifs', value: learningTimeMetrics.learnersWithActivity },
          ],
        })
      }

      // Feuille 4: Croissance des utilisateurs
      if (userGrowthData && userGrowthData.length > 0) {
        excelSheets.push({
          name: "Croissance Utilisateurs",
          headers: [
            { key: "date", label: t('analytics.export.date') || 'Date', width: 15 },
            { key: "new_users", label: t('analytics.charts.user_growth.new_users') || 'Nouveaux utilisateurs', width: 20 },
            { key: "total_users", label: t('analytics.charts.user_growth.total_cumulative') || 'Total utilisateurs', width: 20 },
          ],
          data: userGrowthData.map((point) => ({
            date: point.date,
            new_users: point.newUsers,
            total_users: point.totalUsers,
          })),
        })
      }

      // Feuille 5: Performance des cours
      if (coursePerformanceData && coursePerformanceData.length > 0) {
        excelSheets.push({
          name: "Performance Cours",
          headers: [
            { key: "course_title", label: t('analytics.export.courseTitle') || 'Titre du cours', width: 40 },
            { key: "enrollments", label: t('analytics.export.enrollments') || 'Inscriptions', width: 15 },
            { key: "completion_rate", label: t('analytics.export.completionRate') || 'Taux de complétion (%)', width: 20 },
            { key: "average_rating", label: t('analytics.export.averageRating') || 'Note moyenne', width: 15 },
            { key: "period", label: t('analytics.export.period') || 'Période', width: 15 },
          ],
          data: coursePerformanceData.map((point) => ({
            course_title: point.courseTitle,
            enrollments: point.enrollments,
            completion_rate: point.completionRate.toFixed(2),
            average_rating: point.averageRating.toFixed(2),
            period: point.period,
          })),
        })
      }

      // Générer le fichier Excel
      const timestamp = new Date().toISOString().split('T')[0]
      exportToExcel(excelSheets, `statistiques-analytics-${timestamp}`)

      toast({
        title: t('analytics.export.success.title') || "Export réussi",
        description: t('analytics.export.success.description') || "Les statistiques ont été exportées en Excel",
      })
    } catch (err: any) {
      console.error("Error exporting Excel:", err)
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
    
    // Calculer le taux d'engagement : (apprenants actifs / total apprenants) * 100
    const engagementRate = analyticsMetricsData.totalUsers > 0 
      ? (analyticsMetricsData.activeUsers / analyticsMetricsData.totalUsers) * 100 
      : 0
    
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
        value: `${engagementRate.toFixed(1)}%`,
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
          {exporting ? (t('analytics.export.exporting') || "Export en cours...") : (t('analytics.export.button') || "Exporter en Excel")}
        </Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          {t('analytics.print_button')}
        </Button>
      </div>

      {/* Métriques Analytics */}
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

      {/* Graphique KPI - Nombre d'inscrits */}
      <EnrollmentProgressionChart />

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
