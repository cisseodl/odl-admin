"use client"

import { CategoriesList } from "@/components/admin/categories-list"
import { useLanguage } from "@/contexts/language-context"

export default function CategoriesPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
        <p className="text-muted-foreground">{t('categories.description')}</p>
      </div>
      <CategoriesList />
    </div>
  )
}
