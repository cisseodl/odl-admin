"use client"

import { Suspense } from "react";
import { useLanguage } from "@/contexts/language-context";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { OdcFormationsList } from "@/components/admin/settings/odc-formations-list";

export default function OdcFormationsPage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        title={t("dashboard.quick_actions.odc_formations") || "ODC Formations"}
        description={t("dashboard.quick_actions.odc_formations_description") || "Gérer les formations ODC"}
      />
      <Suspense fallback={<PageLoader />}>
        <div className="mt-6">
          <OdcFormationsList />
        </div>
      </Suspense>
    </>
  );
}
