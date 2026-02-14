// components/admin/evaluations/modals/view-evaluation-modal.tsx
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Image as ImageIcon, BookOpen, CheckCircle, Loader2 } from "lucide-react"
import { evaluationService } from "@/services"
import type { Evaluation } from "@/models/evaluation.model"
import type { EvaluationDisplay } from "../../evaluations-list"

type ViewEvaluationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: EvaluationDisplay
}

export function ViewEvaluationModal({ open, onOpenChange, evaluation }: ViewEvaluationModalProps) {
  const [fullEvaluation, setFullEvaluation] = useState<Evaluation | null>(null)
  const [questionsLoading, setQuestionsLoading] = useState(false)

  useEffect(() => {
    if (!open || !evaluation?.id) {
      setFullEvaluation(null)
      return
    }
    let cancelled = false
    setQuestionsLoading(true)
    evaluationService
      .getEvaluationWithQuestions(evaluation.id)
      .then((data) => {
        if (!cancelled) setFullEvaluation(data ?? null)
      })
      .finally(() => {
        if (!cancelled) setQuestionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, evaluation?.id])

  const questions = fullEvaluation?.questions ?? []
  const hasQuestions = Array.isArray(questions) && questions.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            {evaluation.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                evaluation.status === "Actif" ? "default" : evaluation.status === "Archived" ? "secondary" : "outline"
              }
            >
              {evaluation.status}
            </Badge>
            {evaluation.createdAt && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{evaluation.createdAt}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">{evaluation.description || "Aucune description fournie."}</p>
          </div>

          {evaluation.imagePath && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                Sujet de l'évaluation
              </p>
              <img src={evaluation.imagePath} alt="Sujet de l'évaluation" className="max-w-full h-auto rounded-md" />
            </div>
          )}

          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Questions de l'évaluation
            </p>
            {questionsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement des questions…
              </div>
            ) : !hasQuestions ? (
              <p className="text-sm text-muted-foreground">
                Aucune question pour le moment. L'instructeur peut ajouter des questions au quiz lors de la création ou l'édition de l'évaluation.
              </p>
            ) : (
              <ul className="space-y-4 list-none pl-0">
                {questions.map((q, index) => (
                  <li key={q.id ?? index} className="rounded-md border p-3 bg-muted/30">
                    <p className="text-sm font-medium">
                      {index + 1}. {q.title ?? "Sans titre"}
                    </p>
                    {q.description && (
                      <p className="text-xs text-muted-foreground mt-1">{q.description}</p>
                    )}
                    {q.type && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {q.type}
                      </Badge>
                    )}
                    {Array.isArray(q.reponses) && q.reponses.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {q.reponses.map((r, rIdx) => (
                          <li
                            key={r.id ?? rIdx}
                            className={`flex items-center gap-2 ${r.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"}`}
                          >
                            {r.isCorrect && <CheckCircle className="h-4 w-4 shrink-0" />}
                            <span>{r.title ?? "Réponse"}</span>
                            {r.isCorrect && <span className="text-xs">(correcte)</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
