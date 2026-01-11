"use client"

import { ContentManager } from "@/components/instructor/content-manager"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorContentPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.content.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.content.description')}</p>
      </div>
      <ContentManager />
    </div>
  )
}

