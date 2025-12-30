"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import type { ReactNode } from "react"

type SharedModalFormProps<T extends z.ZodType> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  schema: T
  defaultValues?: Partial<z.infer<T>>
  onSubmit: (data: z.infer<T>) => void
  fields: (form: ReturnType<typeof useForm<z.infer<T>>>) => ReactNode
  submitLabel?: string
  cancelLabel?: string
}

export function SharedModalForm<T extends z.ZodType>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  fields,
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
}: SharedModalFormProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
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
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
      resolver={zodResolver(schema)}
    >
      {(formInstance) => fields(formInstance)}
    </ModalForm>
  )
}

