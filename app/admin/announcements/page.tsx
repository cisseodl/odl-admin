"use client"

import { AnnouncementManager } from "@/components/admin/announcements/announcement-manager"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"

export default function AnnouncementsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('announcements.title')}
        description={t('announcements.description')}
      />
      <AnnouncementManager />
    </div>
  )
}

