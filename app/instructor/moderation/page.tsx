import { InstructorModerationList } from "@/components/instructor/instructor-moderation-list"

export default function InstructorModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Validation des Formations</h1>
        <p className="text-muted-foreground">Validez, rejetez ou modifiez vos formations en attente de validation</p>
      </div>
      <InstructorModerationList />
    </div>
  )
}
