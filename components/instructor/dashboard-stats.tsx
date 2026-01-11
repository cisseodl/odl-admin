"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/page-loader"
import { BookOpen, Users, TrendingUp, Award, Star } from "lucide-react"
import { useEffect, useState } from "react"; // Added useState and useEffect
import { analyticsService, InstructorDashboardStats } from "@/services/analytics.service"; // Import analyticsService and InstructorDashboardStats type

export function InstructorDashboardStats() {
  const { t } = useLanguage()
  const [summary, setSummary] = useState<InstructorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analyticsService.getInstructorDashboardStats(); // Utilisation de la méthode correcte
        setSummary(data);
      } catch (err: any) {
        if (err.message.includes("API Error 403")) {
          setError(t('instructor.dashboard.stats.error_access_denied'));
        } else if (err.message.includes("profil instructeur")) {
          setError(t('instructor.dashboard.stats.error_no_profile'));
        } else {
          setError(err.message || t('instructor.dashboard.stats.error_load'));
        }
        console.error("Error fetching dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const stats = [
    {
      title: t('instructor.dashboard.stats.courses_created'),
      value: summary?.totalCoursesCreated !== undefined ? summary.totalCoursesCreated.toString() : "...",
      change: summary?.publishedCourses !== undefined ? `${summary.publishedCourses} ${t('instructor.dashboard.stats.courses_published')}` : "...",
      icon: BookOpen,
      color: "text-[hsl(var(--info))]",
    },
    {
      title: t('instructor.dashboard.stats.total_students'),
      value: summary?.totalStudents !== undefined ? summary.totalStudents.toLocaleString("fr-FR") : "...",
      change: summary?.newEnrollmentsLast30Days !== undefined ? `+${summary.newEnrollmentsLast30Days} ${t('instructor.dashboard.stats.new_enrollments')}` : "...",
      icon: Users,
      color: "text-[hsl(var(--success))]",
    },
    {
      title: t('instructor.dashboard.stats.average_rating'),
      value: summary?.averageRating !== undefined ? summary.averageRating.toFixed(1) : "...",
      change: summary?.newComments !== undefined ? `${summary.newComments} ${t('instructor.dashboard.stats.new_comments')}` : "...",
      icon: Star,
      color: "text-[hsl(var(--info))]",
    },
    {
      title: t('instructor.dashboard.stats.completion_rate'),
      value: summary?.averageCompletionRate !== undefined ? `${summary.averageCompletionRate.toFixed(1)}%` : "...",
      change: summary?.activeLearners !== undefined ? `${summary.activeLearners} ${t('instructor.dashboard.stats.active_learners')}` : "...",
      icon: Award,
      color: "text-[hsl(var(--success))]",
    },
  ]


  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">{error}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-[hsl(var(--success))]">{stat.change}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

