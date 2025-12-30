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

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[calc(100vh-100px)] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-y-auto">
          <div className="grid gap-4 py-4">{children(form)}</div>
          <DialogFooter className="mt-auto">
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

