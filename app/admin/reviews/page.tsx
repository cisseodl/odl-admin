import { ReviewsList } from "@/components/admin/reviews-list"

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Commentaires</h1>
        <p className="text-muted-foreground">Gérez tous les avis et commentaires des étudiants</p>
      </div>
      <ReviewsList />
    </div>
  )
}

