"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { InstructorDashboardStats } from "@/components/instructor/dashboard-stats";
import { InstructorRecentActivity } from "@/components/instructor/instructor-recent-activity";
import { CoursePerformanceChart } from "@/components/instructor/course-performance-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstructorDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">{t('instructor.dashboard.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('instructor.dashboard.description')}</p>
      </div>

      <InstructorDashboardStats />

      {/* Graphique de performance des cours (Note moyenne) */}
      {user && !authLoading && (
        <Card>
          <CardHeader>
            <CardTitle>{t('instructor.dashboard.average_rating_chart.title')}</CardTitle>
            <CardDescription>{t('instructor.dashboard.average_rating_chart.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <CoursePerformanceChart />
          </CardContent>
        </Card>
      )}

      {/* Intégration du nouveau composant InstructorRecentActivity */}
      {user && !authLoading && <InstructorRecentActivity instructorId={Number(user.id)} limit={5} />}

    </div>
  )
}