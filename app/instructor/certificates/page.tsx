"use client"

import { CertificatesManager } from "@/components/instructor/certificates-manager"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorCertificatesPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.certificates.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.certificates.description')}</p>
      </div>
      <CertificatesManager />
    </div>
  )
}

