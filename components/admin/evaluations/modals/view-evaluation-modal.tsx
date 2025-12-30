// components/admin/evaluations/modals/view-evaluation-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Image as ImageIcon, BookOpen } from "lucide-react"
import type { EvaluationDisplay } from "../../evaluations-list" // Assuming EvaluationDisplay is exported from here

type ViewEvaluationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluation: EvaluationDisplay
}

export function ViewEvaluationModal({ open, onOpenChange, evaluation }: ViewEvaluationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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

          {/* Placeholder for questions associated with the evaluation, if implemented */}
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Questions de l'évaluation
            </p>
            <p className="text-sm text-muted-foreground">
              (Affichage des questions non implémenté. Nécessite l'intégration des endpoints des questions.)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
