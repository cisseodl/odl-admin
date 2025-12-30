"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { instructorSchema, type InstructorFormData } from "@/lib/validations/instructor"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type InstructorFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<InstructorFormData>
  onSubmit: (data: InstructorFormData) => void
  submitLabel?: string
}

export function InstructorFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: InstructorFormModalProps) {
  const form = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
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
      resolver={zodResolver(instructorSchema)}
    >
      {(formInstance) => (
        <>
          <FormField
            type="input"
            name="firstName"
            label="Prénom"
            placeholder="Jean"
            register={formInstance.register}
            error={formInstance.formState.errors.firstName?.message}
          />
          <FormField
            type="input"
            name="lastName"
            label="Nom"
            placeholder="Martin"
            register={formInstance.register}
            error={formInstance.formState.errors.lastName?.message}
          />
          <FormField
            type="input"
            name="email"
            label="Email"
            placeholder="jean.martin@email.com"
            inputType="email"
            register={formInstance.register}
            error={formInstance.formState.errors.email?.message}
          />
          <FormField
            type="input"
            name="phone"
            label="Téléphone (optionnel)"
            placeholder="0123456789"
            register={formInstance.register}
            error={formInstance.formState.errors.phone?.message}
          />
          <FormField
            type="input"
            name="qualifications"
            label="Qualifications"
            placeholder="Maîtrise en Informatique, Certifié XYZ"
            register={formInstance.register}
            error={formInstance.formState.errors.qualifications?.message}
          />
          <FormField
            type="input"
            name="imagePath"
            label="Chemin de l'image (optionnel)"
            placeholder="/path/to/image.png"
            register={formInstance.register}
            error={formInstance.formState.errors.imagePath?.message}
          />
          <FormField
            type="select"
            name="status"
            label="Statut"
            control={formInstance.control}
            options={[
              { value: "Actif", label: "Actif" },
              { value: "Inactif", label: "Inactif" },
              { value: "En attente", label: "En attente" },
            ]}
            error={formInstance.formState.errors.status?.message}
          />
          <FormField
            type="textarea"
            name="bio"
            label="Biographie (optionnel)"
            placeholder="Description de l'instructeur..."
            register={formInstance.register}
            rows={3}
            error={formInstance.formState.errors.bio?.message}
          />
        </>
      )}
    </ModalForm>
  )
}

