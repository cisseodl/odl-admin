"use client"

import { CoursesManager } from "@/components/instructor/courses-manager"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorCoursesPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.courses.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.courses.description')}</p>
      </div>
      <CoursesManager />
    </div>
  )
}

