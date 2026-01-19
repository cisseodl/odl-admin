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
      <DialogContent className="flex flex-col max-h-[calc(100vh-100px)] sm:max-w-[600px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto">
          <ScrollArea className="max-h-[calc(100vh-200px)]">
            <div className="grid gap-4 py-4">{children(form)}</div>
          </ScrollArea>
          <DialogFooter className="mt-auto border-t pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Enregistrement..." : submitLabel}
            </Button>
          </DialogFooter>
          {/* Afficher les erreurs de validation globales */}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="text-sm text-destructive px-6 pb-2 space-y-1 w-full overflow-hidden">
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
        </form>
      </DialogContent>
    </Dialog>
  )
}

