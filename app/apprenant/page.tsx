"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { PageLoader } from "@/components/ui/page-loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Award, CheckCircle, Lightbulb } from "lucide-react"
import { analyticsService, StudentDashboardStats } from "@/services/analytics.service"

export default function ApprenantDashboard() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth()
  const [dashboardStats, setDashboardStats] = useState<StudentDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false)
      return
    }

    const fetchDashboardStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const stats = await analyticsService.getStudentDashboardStats()
        setDashboardStats(stats)
      } catch (err: any) {
        setError(err.message || "Failed to fetch student dashboard stats.")
        console.error("Error fetching student dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardStats()
  }, [user, authLoading])

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('apprenant.dashboard.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('apprenant.dashboard.description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('apprenant.dashboard.stats.enrolledCourses')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalCoursesEnrolled || 0}</div>
            <p className="text-xs text-muted-foreground">{t('apprenant.dashboard.stats.enrolledCoursesDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('apprenant.dashboard.stats.completedCourses')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.completedCourses || 0}</div>
            <p className="text-xs text-muted-foreground">{t('apprenant.dashboard.stats.completedCoursesDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('apprenant.dashboard.stats.certificates')}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.certificatesEarned || 0}</div>
            <p className="text-xs text-muted-foreground">{t('apprenant.dashboard.stats.certificatesDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('apprenant.dashboard.stats.quizzesPassed')}</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.quizzesPassed || 0}</div>
            <p className="text-xs text-muted-foreground">{t('apprenant.dashboard.stats.quizzesPassedDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vous pouvez ajouter d'autres sections ici, comme les cours en cours, les dernières activités, etc. */}
    </div>
  )
}
