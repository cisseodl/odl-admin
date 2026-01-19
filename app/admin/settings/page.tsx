"use client"

// app/admin/settings/page.tsx
import { Suspense } from "react";
import { useLanguage } from "@/contexts/language-context"
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RubriquesList } from "@/components/admin/settings/rubriques-list";
import { SiteConfigurationForm } from "@/components/admin/settings/site-configuration-form";
import { OdcFormationsList } from "@/components/admin/settings/odc-formations-list";
import { List, Settings, GraduationCap } from "lucide-react";

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
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
              <TabsTrigger 
                value="general"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('settings.site.tab_general')}
              </TabsTrigger>
              <TabsTrigger
                value="rubriques"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                <List className="h-4 w-4 mr-2" />
                {t('settings.site.tab_rubriques')}
              </TabsTrigger>
              <TabsTrigger
                value="odc-formations"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                ODC Formations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <SiteConfigurationForm />
            </TabsContent>

            <TabsContent value="rubriques" className="space-y-4">
              <RubriquesList />
            </TabsContent>

            <TabsContent value="odc-formations" className="space-y-4">
              <OdcFormationsList />
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </>
  );
}
