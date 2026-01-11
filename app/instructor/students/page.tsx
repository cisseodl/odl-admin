"use client"

import { StudentsTracker } from "@/components/instructor/students-tracker"
import { useLanguage } from "@/contexts/language-context"

export default function InstructorStudentsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.students.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.students.description')}</p>
      </div>
      <StudentsTracker />
    </div>
  )
}

