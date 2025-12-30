import { UsersList } from "@/components/admin/users-list"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez tous les utilisateurs de la plateforme</p>
      </div>
      <UsersList />
    </div>
  )
}
