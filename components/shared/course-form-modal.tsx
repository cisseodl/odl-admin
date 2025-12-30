"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { courseSchema, type CourseFormData } from "@/lib/validations/course"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type CourseFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<CourseFormData>
  onSubmit: (data: CourseFormData) => void
  submitLabel?: string
}

export function CourseFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: CourseFormModalProps) {
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
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
      resolver={zodResolver(courseSchema)}
    >
      {(formInstance) => (
        <>
          <FormField
            type="input"
            name="title"
            label="Titre de la formation"
            placeholder="Formation React Avancé"
            register={formInstance.register}
            error={formInstance.formState.errors.title?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              type="input"
              name="instructor"
              label="Instructeur"
              placeholder="Nom de l'instructeur"
              register={formInstance.register}
              error={formInstance.formState.errors.instructor?.message}
            />
            <FormField
              type="input"
              name="category"
              label="Catégorie"
              placeholder="Développement Web"
              register={formInstance.register}
              error={formInstance.formState.errors.category?.message}
            />
          </div>
          <FormField
            type="input"
            name="duration"
            label="Durée"
            placeholder="10h 30min"
            register={formInstance.register}
            error={formInstance.formState.errors.duration?.message}
          />
          <FormField
            type="select"
            name="status"
            label="Statut"
            control={formInstance.control}
            options={[
              { value: "Brouillon", label: "Brouillon" },
              { value: "En révision", label: "En révision" },
              { value: "Publié", label: "Publié" },
            ]}
            error={formInstance.formState.errors.status?.message}
          />
        </>
      )}
    </ModalForm>
  )
}

