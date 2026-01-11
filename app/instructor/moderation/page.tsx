"use client"

import { InstructorModerationList } from "@/components/instructor/instructor-moderation-list"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorModerationPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.moderation.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.moderation.description')}</p>
      </div>
      <InstructorModerationList />
    </div>
  )
}
