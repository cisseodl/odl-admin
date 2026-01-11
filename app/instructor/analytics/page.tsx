"use client"

import { InstructorAnalyticsDashboard } from "@/components/instructor/analytics-dashboard"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorAnalyticsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.analytics.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.analytics.description')}</p>
      </div>
      <InstructorAnalyticsDashboard />
    </div>
  )
}

