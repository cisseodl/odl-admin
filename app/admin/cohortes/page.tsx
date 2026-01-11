"use client"

import { CohortesList } from "@/components/admin/cohortes-list"
import { useLanguage } from "@/contexts/language-context"

export default function CohortesPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('cohortes.title')}</h1>
        <p className="text-muted-foreground">{t('cohortes.description')}</p>
      </div>
      <CohortesList />
    </div>
  )
}
