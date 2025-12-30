"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Save, Mail, Bell, Shield, Globe, Palette, Database, Code, FileCheck, FileText, Key, Loader2, List } from "lucide-react"
import { DataExport } from "@/components/admin/gdpr/data-export"
import { DataDeletion } from "@/components/admin/gdpr/data-deletion"
import { AuditLogComponent } from "@/components/admin/audit/audit-log"
import { PermissionsManager } from "@/components/admin/permissions/permissions-manager"
import { RubriquesList } from "@/components/admin/rubriques-list" // Import RubriquesList
import { Configuration } from "@/models"; // Import Configuration model
import { configurationService } from "@/services"; // Import configurationService
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader

export function SettingsPanel() {
  const [settings, setSettings] = useState<Configuration>({ // Initialize with default values for Configuration or fetched data
    id: 1, // Assuming a single configuration entry with ID 1
    activate: true,
    // Default values, will be overwritten by fetched data
    homepageText: "",
    homepageImageUrl: "",
    loginImageUrl: "",
    aboutText: "",
    aboutImageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfiguration = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedConfig = await configurationService.getConfiguration();
        setSettings(fetchedConfig);
      } catch (err: any) {
        setError(err.message || "Failed to fetch configuration.");
        console.error("Error fetching configuration:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfiguration();
  }, []); // Run once on mount

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await configurationService.updateConfiguration(settings); // Pass the entire settings object
      console.log("Settings saved:", settings);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
      console.error("Error saving settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
                    <TabsTrigger 
                      value="general"
                      className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                    >
                      Général
                    </TabsTrigger>
                    <TabsTrigger
                      value="rubriques"
                      className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                    >
                      <List className="h-4 w-4 mr-2" /> {/* Icon for rubriques */}
                      Rubriques
                    </TabsTrigger>
                    <TabsTrigger 
                      value="theme"
                      className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
                    >
                      Thème
                    </TabsTrigger>
                  </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Configurez les informations de base de votre plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* These fields are not directly part of Configuration model. Keeping them as local placeholders. */}
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input
                  id="siteName"
                  value="E-Learning Platform" // Placeholder
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Description (Homepage Text)</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.homepageText || ""}
                  onChange={(e) => setSettings({ ...settings, homepageText: e.target.value })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="aboutText">Texte 'À propos'</Label>
                <Textarea
                  id="aboutText"
                  value={settings.aboutText || ""}
                  onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
                />
              </div>
              {/* Other fields like email, phone, address are not in Configuration model. */}
              <div className="space-y-2">
                <Label htmlFor="email">Email de contact</Label>
                <Input
                  id="email"
                  type="email"
                  value="contact@elearning.com" // Placeholder
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value="+33 1 23 45 67 89" // Placeholder
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value="123 Rue de la Formation, 75001 Paris" // Placeholder
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubriques" className="space-y-4"> {/* New TabContent for Rubriques */}
          <RubriquesList />
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personnalisation du thème
              </CardTitle>
              <CardDescription>Personnalisez les couleurs et l'apparence de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* These fields are not directly part of Configuration model. Keeping them as disabled placeholders. */}
              <div className="space-y-2">
                <Label>Couleur principale</Label>
                <Input type="color" defaultValue="#3b82f6" className="w-20 h-10" disabled />
              </div>
              <div className="space-y-2">
                <Label>Mode sombre</Label>
                <Switch defaultChecked={false} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <span className="text-destructive">•</span>
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
