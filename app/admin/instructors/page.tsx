import { InstructorsList } from "@/components/admin/instructors-list"

export default function InstructorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Formateurs</h1>
        <p className="text-muted-foreground">Gérez tous les formateurs de la plateforme</p>
      </div>
      <InstructorsList />
    </div>
  )
}

