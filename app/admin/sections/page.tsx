"use client"

import { Suspense } from "react";
import { useLanguage } from "@/contexts/language-context";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { RubriquesList } from "@/components/admin/settings/rubriques-list";

export default function SectionsPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t("dashboard.quick_actions.manage_sections") || "Gestion des Sections"}
        description={t("settings.site.tab_rubriques_description") || "Gérer les rubriques et sections du site"}
      />
      <Suspense fallback={<PageLoader />}>
        <div className="mt-6">
          <RubriquesList />
        </div>
      </Suspense>
    </>
  );
}
