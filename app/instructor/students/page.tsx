import { StudentsTracker } from "@/components/instructor/students-tracker"

export default function InstructorStudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Apprenants</h1>
        <p className="text-muted-foreground">Suivez la progression et les scores de vos apprenants</p>
      </div>
      <StudentsTracker />
    </div>
  )
}

