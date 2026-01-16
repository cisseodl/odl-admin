"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskConical } from "lucide-react"

export default function InstructorLabsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.labs.title')}</h1>
        <p className="text-muted-foreground">{t('instructor.labs.description')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            {t('instructor.labs.title')}
          </CardTitle>
          <CardDescription>{t('instructor.labs.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('instructor.labs.empty')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
