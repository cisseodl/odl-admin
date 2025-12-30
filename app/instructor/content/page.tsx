import { ContentManager } from "@/components/instructor/content-manager"

export default function InstructorContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Contenus</h1>
        <p className="text-muted-foreground">Upload et organisez vos contenus pédagogiques</p>
      </div>
      <ContentManager />
    </div>
  )
}

