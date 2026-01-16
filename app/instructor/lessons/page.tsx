"use client"

import { useLanguage } from "@/contexts/language-context"
import { ContentManager } from "@/components/instructor/content-manager"

export default function InstructorLessonsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.lessons.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.lessons.description')}</p>
      </div>
      <ContentManager />
    </div>
  )
}
