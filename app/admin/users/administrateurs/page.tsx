"use client"

import { AdministrateursList } from "@/components/admin/administrateurs-list"
import { useLanguage } from "@/contexts/language-context"

export default function AdministrateursPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('users.admins.title')}</h1>
        <p className="text-muted-foreground">{t('users.admins.description')}</p>
      </div>
      <AdministrateursList />
    </div>
  )
}
