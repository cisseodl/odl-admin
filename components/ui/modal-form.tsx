"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm, type UseFormReturn, type Resolver } from "react-hook-form"
import type { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

type ModalFormProps<T extends Record<string, any>> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<T>
  onSubmit: (data: T) => void
  children: (form: UseFormReturn<T>) => ReactNode
  submitLabel?: string
  cancelLabel?: string
  resolver?: Resolver<T>
}

export function ModalForm<T extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  children,
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  resolver,
}: ModalFormProps<T>) {
  const form = useForm<T>({
    defaultValues,
    ...(resolver ? { resolver } : {}),
  })

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data)
      form.reset()
      onOpenChange(false)
    },
    (errors) => {
      // Afficher les erreurs dans la console pour le debug
      console.error("Form validation errors:", errors)
      // Ne pas fermer le modal si la validation échoue
    }
  )

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[90vh] sm:max-w-[600px] w-[95vw] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="grid gap-4 py-4">{children(form)}</div>
            {/* Afficher les erreurs de validation globales */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-sm text-destructive pb-4 space-y-1 w-full overflow-hidden">
                <p className="font-medium">Erreurs de validation :</p>
                <ul className="list-disc list-inside space-y-1 w-full">
                  {Object.entries(form.formState.errors).map(([field, error]: [string, any]) => (
                    <li key={field} className="break-words break-all text-wrap w-full pr-2">
                      <span className="font-medium">{field}:</span> <span className="break-words break-all">{error?.message || "Erreur"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4 px-6 pb-6 flex-shrink-0 mt-auto">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Enregistrement..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

