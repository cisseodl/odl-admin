"use client"

// app/admin/settings/page.tsx - Paramètres : Configuration Générale uniquement
import { Suspense } from "react";
import { useLanguage } from "@/contexts/language-context"
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { SiteConfigurationForm } from "@/components/admin/settings/site-configuration-form";

export default function SettingsPage() {
  const { t } = useLanguage()
  return (
    <>
      <PageHeader
        title={t('settings.site.title')}
        description={t('settings.site.description')}
      />

      <Suspense fallback={<PageLoader />}>
        <div className="space-y-8 mt-6">
          <SiteConfigurationForm />
        </div>
      </Suspense>
    </>
  );
}
