import { SettingsPanel } from "@/components/admin/settings-panel"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configurez les paramètres de la plateforme</p>
      </div>
      <SettingsPanel />
    </div>
  )
}

