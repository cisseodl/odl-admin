"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { InstructorDashboardStats } from "@/components/instructor/dashboard-stats";
import { InstructorRecentActivity } from "@/components/instructor/instructor-recent-activity";

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

      {/* Intégration du nouveau composant InstructorRecentActivity */}
      {user && !authLoading && <InstructorRecentActivity instructorId={Number(user.id)} limit={5} />}

    </div>
  )
}