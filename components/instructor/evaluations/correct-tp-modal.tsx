"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { Save } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { EvaluationAttempt } from "@/models/evaluation.model"

const correctTpSchema = z.object({
  score: z.number().min(0, { message: "Le score doit être au moins 0." }).max(100, { message: "Le score ne peut pas dépasser 100." }),
  feedback: z.string().optional(),
})

type CorrectTpFormData = z.infer<typeof correctTpSchema>

type CorrectTpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attempt: EvaluationAttempt | null
  onSubmit: (data: CorrectTpFormData) => Promise<void>
}

export function CorrectTpModal({
  open,
  onOpenChange,
  attempt,
  onSubmit,
}: CorrectTpModalProps) {
  const { t } = useLanguage()

  const form = useForm<CorrectTpFormData>({
    resolver: zodResolver(correctTpSchema),
    defaultValues: {
      score: 0,
      feedback: "",
    },
  })

  const handleSubmit = async (data: CorrectTpFormData) => {
    await onSubmit(data)
    form.reset()
  }

  if (!attempt) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('evaluations.correct.title') || "Corriger le TP"}</DialogTitle>
          <DialogDescription>
            {t('evaluations.correct.description') || "Donnez une note entre 0 et 100 pour cette soumission"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            {attempt.submittedFileUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('evaluations.correct.submitted_file') || "Fichier soumis"}</label>
                <a
                  href={attempt.submittedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {t('evaluations.correct.view_file') || "Voir le fichier"}
                </a>
              </div>
            )}
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('evaluations.correct.score') || "Score (0-100)"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('evaluations.correct.feedback') || "Commentaires (optionnel)"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('evaluations.correct.feedback_placeholder') || "Commentaires pour l'apprenant..."}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {t('evaluations.correct.submit') || "Enregistrer la correction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
