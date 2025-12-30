import { CohortesList } from "@/components/admin/cohortes-list"

export default function CohortesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Cohortes</h1>
        <p className="text-muted-foreground">Gérez toutes les cohortes de la plateforme</p>
      </div>
      <CohortesList />
    </div>
  )
}
