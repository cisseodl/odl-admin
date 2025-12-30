"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { contentSchema, type ContentFormData } from "@/lib/validations/content"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type ContentFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<ContentFormData>
  onSubmit: (data: ContentFormData) => void
  submitLabel?: string
}

export function ContentFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: ContentFormModalProps) {
  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
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
      resolver={zodResolver(contentSchema)}
    >
      {(formInstance) => (
        <>
          <FormField
            type="input"
            name="title"
            label="Titre du contenu"
            placeholder="Introduction à React"
            register={formInstance.register}
            error={formInstance.formState.errors.title?.message}
          />
          <FormField
            type="select"
            name="type"
            label="Type"
            control={formInstance.control}
            options={[
              { value: "Vidéo", label: "Vidéo" },
              { value: "Document", label: "Document" },
              { value: "Image", label: "Image" },
              { value: "Quiz", label: "Quiz" },
              { value: "Fichier", label: "Fichier" },
            ]}
            error={formInstance.formState.errors.type?.message}
          />
          <FormField
            type="input"
            name="course"
            label="Formation"
            placeholder="Formation associée"
            register={formInstance.register}
            error={formInstance.formState.errors.course?.message}
          />
          <FormField
            type="input"
            name="module"
            label="Module (optionnel)"
            placeholder="Module 1"
            register={formInstance.register}
            error={formInstance.formState.errors.module?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              type="input"
              name="duration"
              label="Durée (optionnel)"
              placeholder="15:30"
              register={formInstance.register}
              error={formInstance.formState.errors.duration?.message}
            />
            <FormField
              type="input"
              name="size"
              label="Taille (optionnel)"
              placeholder="125 MB"
              register={formInstance.register}
              error={formInstance.formState.errors.size?.message}
            />
          </div>
          <FormField
            type="select"
            name="status"
            label="Statut"
            control={formInstance.control}
            options={[
              { value: "Brouillon", label: "Brouillon" },
              { value: "Publié", label: "Publié" },
            ]}
            error={formInstance.formState.errors.status?.message}
          />
        </>
      )}
    </ModalForm>
  )
}

