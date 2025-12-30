import { ApprenantsList } from "@/components/admin/apprenants-list"

export default function ApprenantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Apprenants</h1>
        <p className="text-muted-foreground">Gérez tous les apprenants de la plateforme</p>
      </div>
      <ApprenantsList />
    </div>
  )
}
