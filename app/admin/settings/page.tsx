// app/admin/settings/page.tsx
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RubriquesList } from "@/components/admin/settings/rubriques-list";
import { SiteConfigurationForm } from "@/components/admin/settings/site-configuration-form";
import { List, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Paramètres du Site"
        description="Gérez la configuration générale et les rubriques de contenu de la plateforme."
      />

      <Suspense fallback={<PageLoader />}>
        <div className="space-y-8 mt-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
              <TabsTrigger 
                value="general"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configuration Générale
              </TabsTrigger>
              <TabsTrigger
                value="rubriques"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                <List className="h-4 w-4 mr-2" />
                Gestion des Rubriques
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <SiteConfigurationForm />
            </TabsContent>

            <TabsContent value="rubriques" className="space-y-4">
              <RubriquesList />
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </>
  );
}
