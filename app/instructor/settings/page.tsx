"use client"

import { SiteConfigurationForm } from "@/components/admin/settings/site-configuration-form"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorSettingsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.settings.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.settings.description')}</p>
      </div>
      <SiteConfigurationForm />
    </div>
  )
}

