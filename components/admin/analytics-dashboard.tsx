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
} from "lucide-react"
import { Button } from "@/components/ui/button" // Import Button component
import { useEffect, useState, useMemo } from "react" // Import hooks
import { analyticsService, type AnalyticsMetrics, type LearningTimeMetrics } from "@/services/analytics.service" // Import service
import { PageLoader } from "@/components/ui/page-loader" // Import PageLoader
import { useLanguage } from "@/contexts/language-context" // Import useLanguage

export function AnalyticsDashboard() {
  const { t } = useLanguage()
  const [analyticsMetricsData, setAnalyticsMetricsData] = useState<AnalyticsMetrics | null>(null)
  const [learningTimeMetrics, setLearningTimeMetrics] = useState<LearningTimeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        change: `${analyticsMetricsData.activeUsers.toLocaleString("fr-FR")} ${t("analytics.activeUsers")} / ${analyticsMetricsData.totalUsers.toLocaleString("fr-FR")} ${t("analytics.totalUsers")}`,
        icon: TrendingUp,
        color: "text-[hsl(var(--warning))]",
      },
    ]
  }, [analyticsMetricsData, t])

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Imprimer les Statistiques
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
        <CoursePerformance />
      </div>

      {/* Onglets pour analyses détaillées */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
          <TabsTrigger
            value="learners"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            Apprenants
          </TabsTrigger>
          <TabsTrigger
            value="learning-time"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            Temps d'apprentissage
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            Rapports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="learners">
          <LearnerProgressList />
        </TabsContent>

        <TabsContent value="learning-time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold leading-tight">Temps d'apprentissage</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Temps passé, sessions, interactions et activité
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
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">Temps moyen par cours</p>
                    <p className="text-3xl font-bold leading-tight">{Math.round(learningTimeMetrics.averageTimePerCourseMinutes)} min</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {learningTimeMetrics.coursesWithActivity} cours avec activité
                    </p>
                  </div>
                  <div className="p-6 rounded-lg border shadow-sm bg-card">
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">Sessions actives</p>
                    <p className="text-3xl font-bold leading-tight">{learningTimeMetrics.activeSessions.toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-muted-foreground mt-2">24 dernières heures</p>
                  </div>
                  <div className="p-6 rounded-lg border shadow-sm bg-card">
                    <p className="text-sm text-muted-foreground mb-2 leading-relaxed">Temps moyen par apprenant</p>
                    <p className="text-3xl font-bold leading-tight">{Math.round(learningTimeMetrics.averageTimePerLearnerMinutes)} min</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {learningTimeMetrics.learnersWithActivity} apprenants actifs
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
                Rapports
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Générez et exportez des rapports détaillés sur votre plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ReportCard
                  reportType={{
                    id: "learning-time",
                    title: "Temps d'apprentissage",
                    description: "Temps passé, sessions actives et progression des apprenants",
                    icon: Clock,
                    color: "text-[hsl(var(--chart-1))]",
                  }}
                />
                <ReportCard
                  reportType={{
                    id: "users",
                    title: "Rapport Utilisateurs",
                    description: "Inscriptions, rétention, segmentation et croissance",
                    icon: Users,
                    color: "text-[hsl(var(--chart-2))]",
                  }}
                />
                <ReportCard
                  reportType={{
                    id: "courses",
                    title: "Rapport Formations",
                    description: "Performance, popularité et statistiques par formation",
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
