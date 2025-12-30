import { QuizzesManager } from "@/components/instructor/quizzes-manager"

export default function InstructorQuizzesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quiz & Exercices</h1>
        <p className="text-muted-foreground">Créez et gérez vos quiz et exercices pour vos formations</p>
      </div>
      <QuizzesManager />
    </div>
  )
}

