"use client"

import { InstructorEvaluationsList } from "@/components/instructor/evaluations/instructor-evaluations-list"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorEvaluationsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('evaluations.title')}</h1>
        <p className="text-muted-foreground">{t('evaluations.description')}</p>
      </div>
      <InstructorEvaluationsList />
    </div>
  )
}
