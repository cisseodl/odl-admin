"use client"

import { QuizzesManager } from "@/components/instructor/quizzes-manager"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorQuizzesPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.quizzes.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.quizzes.description')}</p>
      </div>
      <QuizzesManager />
    </div>
  )
}

