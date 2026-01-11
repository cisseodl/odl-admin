"use client"

import { useLanguage } from "@/contexts/language-context"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { PageHeader } from "@/components/ui/page-header"

export default function AnalyticsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('analytics.page.title')}
        description={t('analytics.page.description')}
      />
      <AnalyticsDashboard />
    </div>
  )
}

