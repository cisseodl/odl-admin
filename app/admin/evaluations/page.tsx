import { EvaluationsList } from "@/components/admin/evaluations-list"

export default function EvaluationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Évaluations</h1>
        <p className="text-muted-foreground">Gérez toutes les évaluations de la plateforme</p>
      </div>
      <EvaluationsList />
    </div>
  )
}
