"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { rubriqueSchema, type RubriqueFormData } from "@/lib/validations/rubrique"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type RubriqueFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<RubriqueFormData>
  onSubmit: (data: RubriqueFormData) => void
  submitLabel?: string
}

export function RubriqueFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: RubriqueFormModalProps) {
  const form = useForm<RubriqueFormData>({
    resolver: zodResolver(rubriqueSchema),
    defaultValues,
  })

  // Determine if in edit mode
  const isEditMode = !!defaultValues?.rubrique;

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      resolver={zodResolver(rubriqueSchema)}
    >
      {(formInstance) => (
        <>
          <FormField
            type="input"
            name="rubrique"
            label="Nom de la rubrique"
            placeholder="Orange Digital Kalanso"
            register={formInstance.register}
            error={formInstance.formState.errors.rubrique?.message}
          />
          {isEditMode ? (
            <FormField
              type="input"
              name="image"
              label="Image (URL)"
              placeholder="image_kalanso.jpg"
              register={formInstance.register}
              error={formInstance.formState.errors.image?.message}
            />
          ) : (
            <FormField
              type="input"
              name="imageFile"
              label="Image (Fichier)"
              inputType="file"
              register={formInstance.register}
              error={formInstance.formState.errors.imageFile?.message}
            />
          )}
          <FormField
            type="textarea"
            name="description"
            label="Description"
            placeholder="Description du programme..."
            register={formInstance.register}
            rows={3}
            error={formInstance.formState.errors.description?.message}
          />
          <FormField
            type="textarea"
            name="objectifs"
            label="Objectifs principaux"
            placeholder="Former les jeunes aux métiers du code..."
            register={formInstance.register}
            rows={3}
            error={formInstance.formState.errors.objectifs?.message}
          />
          <FormField
            type="textarea"
            name="publicCible" // Updated casing
            label="Public cible"
            placeholder="Jeunes, étudiants, développeurs..."
            register={formInstance.register}
            rows={3}
            error={formInstance.formState.errors.publicCible?.message}
          />
          <FormField
            type="input"
            name="dureeFormat" // Updated casing
            label="Durée et format"
            placeholder="3-6 mois, cours pratiques..."
            register={formInstance.register}
            error={formInstance.formState.errors.dureeFormat?.message}
          />
          <FormField
            type="input"
            name="lienRessources"
            label="Lien ressources (URL)"
            placeholder="https://odc.orange.com/kalanso"
            register={formInstance.register}
            error={formInstance.formState.errors.lienRessources?.message}
          />
        </>
      )}
    </ModalForm>
  )
}
