"use client"

import { useAuth } from "@/contexts/auth-context"
import { InstructorDashboardStats } from "@/components/instructor/dashboard-stats";
import { InstructorRecentActivity } from "@/components/instructor/instructor-recent-activity";

export default function InstructorDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Tableau de bord Formateur</h1>
        <p className="text-muted-foreground mt-2">Vue d'overview de vos formations et apprenants</p>
      </div>

      <InstructorDashboardStats />

      {/* Intégration du nouveau composant InstructorRecentActivity */}
      {user && !authLoading && <InstructorRecentActivity instructorId={Number(user.id)} limit={5} />}

    </div>
  )
}