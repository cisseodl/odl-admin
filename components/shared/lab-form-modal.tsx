"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { labSchema, type LabFormData } from "@/lib/validations/lab"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"


type LabFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<LabFormData>
  onSubmit: (data: LabFormData) => void
  submitLabel?: string
}

export function LabFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: LabFormModalProps) {
  const form = useForm<LabFormData>({
    resolver: zodResolver(labSchema),
    defaultValues,
  })

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      resolver={zodResolver(labSchema)}
      form={form}
    >
      {() => (
        <>
          <FormField
            type="input"
            name="title"
            label="Titre du lab"
            placeholder="Introduction à Docker"
            register={form.register}
            error={form.formState.errors.title?.message}
          />
          <FormField
            type="textarea"
            name="description"
            label="Description (optionnel)"
            placeholder="Décrivez ce que ce lab permet d'apprendre..."
            register={form.register}
            rows={3}
            error={form.formState.errors.description?.message}
          />
          <FormField
            type="textarea"
            name="uploadedFiles"
            label="Fichiers uploadés (optionnel)"
            placeholder='Format JSON: ["/path/to/file1.pdf", "/path/to/file2.zip"] ou laissez vide'
            register={form.register}
            rows={3}
            error={form.formState.errors.uploadedFiles?.message}
          />
          <FormField
            type="textarea"
            name="resourceLinks"
            label="Liens ressources (optionnel)"
            placeholder='Format JSON: ["https://example.com/resource1", "https://example.com/resource2"] ou laissez vide'
            register={form.register}
            rows={3}
            error={form.formState.errors.resourceLinks?.message}
          />
          <FormField
            type="number"
            name="estimatedDurationMinutes"
            label="Durée estimée (minutes)"
            placeholder="60"
            register={form.register}
            error={form.formState.errors.estimatedDurationMinutes?.message}
          />
          <FormField
            type="textarea"
            name="instructions"
            label="Instructions du lab"
            placeholder="Étapes pour compléter le lab..."
            register={form.register}
            rows={5}
            error={form.formState.errors.instructions?.message}
          />
          <Controller
            control={form.control}
            name="activate"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activate"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="activate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Activer le lab
                </Label>
              </div>
            )}
          />
        </>
      )}
    </ModalForm>
  )
}
