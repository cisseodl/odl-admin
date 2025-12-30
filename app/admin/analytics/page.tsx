import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { PageHeader } from "@/components/ui/page-header"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques et Analyses"
        description="Analysez les performances et l'engagement de votre plateforme"
      />
      <AnalyticsDashboard />
    </div>
  )
}

