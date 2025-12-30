import { InstructorAnalyticsDashboard } from "@/components/instructor/analytics-dashboard"

export default function InstructorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques de Performance</h1>
        <p className="text-muted-foreground">Analysez les performances de vos formations et apprenants</p>
      </div>
      <InstructorAnalyticsDashboard />
    </div>
  )
}

