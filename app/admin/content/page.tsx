"use client"

import { ContentManager } from "@/components/admin/content-manager"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"

export default function AdminContentPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('content.title')}
        description={t('content.description')}
      />
      <ContentManager />
    </div>
  )
}
