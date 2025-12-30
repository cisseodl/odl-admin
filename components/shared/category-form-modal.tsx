"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { categorySchema, type CategoryFormData } from "@/lib/validations/category"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type CategoryFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<CategoryFormData>
  onSubmit: (data: CategoryFormData) => void
  submitLabel?: string
}

export function CategoryFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: CategoryFormModalProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  })

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      resolver={zodResolver(categorySchema)}
    >
      {(formInstance) => (
        <>
          <FormField
            type="input"
            name="title"
            label="Titre de la catégorie"
            placeholder="Développement Web"
            register={formInstance.register}
            error={formInstance.formState.errors.title?.message}
          />
          <FormField
            type="textarea"
            name="description"
            label="Description (optionnel)"
            placeholder="Description de la catégorie..."
            register={formInstance.register}
            rows={3}
            error={formInstance.formState.errors.description?.message}
          />
        </>
      )}
    </ModalForm>
  )
}