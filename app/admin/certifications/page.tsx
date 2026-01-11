"use client"

import { CertificationsList } from "@/components/admin/certifications-list"
import { useLanguage } from "@/contexts/language-context"

export default function CertificationsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('certifications.title')}</h1>
        <p className="text-muted-foreground">{t('certifications.description')}</p>
      </div>
      <CertificationsList />
    </div>
  )
}

