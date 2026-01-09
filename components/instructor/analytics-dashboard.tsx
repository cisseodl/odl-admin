"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CoursePerformanceChart } from "@/components/instructor/course-performance-chart"
import { TrendingUp, Users, Clock, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { analyticsService, type InstructorDashboardStats } from "@/services/analytics.service"
import { PageLoader } from "@/components/ui/page-loader"

export function InstructorAnalyticsDashboard() {
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
        setError(err.message || "Impossible de charger les statistiques.")
        console.error("Error fetching instructor stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
            <CardTitle className="text-sm font-medium">Taux de complétion moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageCompletionRate.toFixed(1) || "0.0"}%</div>
            <p className="text-xs text-muted-foreground">{stats?.totalEnrollments || 0} inscriptions totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apprenants actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLearners.toLocaleString("fr-FR") || "0"}</div>
            <p className="text-xs text-muted-foreground">30 derniers jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen quiz</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageQuizScore.toFixed(1) || "0.0"}%</div>
            <p className="text-xs text-muted-foreground">Moyenne des quiz</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating.toFixed(1) || "0.0"}/5</div>
            <p className="text-xs text-muted-foreground">{stats?.newComments || 0} nouveaux avis (30j)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance des formations</CardTitle>
          <CardDescription>Analyse détaillée de vos formations</CardDescription>
        </CardHeader>
        <CardContent>
          <CoursePerformanceChart />
        </CardContent>
      </Card>
    </div>
  )
}

