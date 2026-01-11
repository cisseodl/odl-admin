"use client"

import { NotificationsCenter } from "@/components/admin/notifications/notifications-center"
import { PageHeader } from "@/components/ui/page-header"
import { useLanguage } from "@/contexts/language-context"

export default function NotificationsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('notifications.title')}
        description={t('notifications.description')}
      />
      <NotificationsCenter />
    </div>
  )
}

