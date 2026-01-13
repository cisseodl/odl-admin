"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CoursePerformanceChart } from "@/components/instructor/course-performance-chart"
import { TrendingUp, Users, Clock, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { analyticsService, type InstructorDashboardStats } from "@/services/analytics.service"
import { PageLoader } from "@/components/ui/page-loader"

export function InstructorAnalyticsDashboard() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<InstructorDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await analyticsService.getInstructorDashboardStats()
        setStats(data)
      } catch (err: any) {
        setError(err.message || t('instructor.dashboard.stats.error_load'))
        console.error("Error fetching instructor stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [t])

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('instructor.dashboard.stats.completion_rate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageCompletionRate.toFixed(1) || "0.0"}%</div>
            <p className="text-xs text-muted-foreground">{stats?.totalEnrollments || 0} {t('instructor.dashboard.stats.total_enrollments')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('instructor.dashboard.stats.active_learners')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLearners.toLocaleString("fr-FR") || "0"}</div>
            <p className="text-xs text-muted-foreground">{t('instructor.dashboard.stats.last_30_days')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('instructor.dashboard.stats.certified_by_module')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCertificatesByModule.toLocaleString("fr-FR") || "0"}</div>
            <p className="text-xs text-muted-foreground">{t('instructor.dashboard.stats.total_certificates')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('instructor.dashboard.stats.average_rating')}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating.toFixed(1) || "0.0"}/5</div>
            <p className="text-xs text-muted-foreground">{stats?.newComments || 0} {t('instructor.dashboard.stats.new_comments')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('instructor.analytics.performance.title')}</CardTitle>
          <CardDescription>{t('instructor.analytics.performance.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CoursePerformanceChart />
        </CardContent>
      </Card>
    </div>
  )
}

