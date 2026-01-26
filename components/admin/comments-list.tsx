"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/admin/empty-state"
import { MessageSquare } from "lucide-react"

export function CommentsList() {
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('comments.list.title')}</CardTitle>
        <CardDescription>{t('comments.list.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState icon={MessageSquare} title={t('comments.empty.title')} description={t('comments.empty.description')} />
      </CardContent>
    </Card>
  )
}