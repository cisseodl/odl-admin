import { CategoriesList } from "@/components/admin/categories-list"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Catégories</h1>
        <p className="text-muted-foreground">Organisez les formations par catégories</p>
      </div>
      <CategoriesList />
    </div>
  )
}
