import { CoursesManager } from "@/components/instructor/courses-manager"

export default function InstructorCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion de Mes Formations</h1>
        <p className="text-muted-foreground">Créez et gérez vos formations, modules, chapitres et vidéos</p>
      </div>
      <CoursesManager />
    </div>
  )
}

