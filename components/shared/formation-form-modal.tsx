"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { formationSchema, type FormationFormData } from "@/lib/validations/formation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Categorie } from "@/models"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller } from "react-hook-form"

type FormationFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<FormationFormData>
  onSubmit: (data: FormationFormData) => void
  submitLabel?: string
  categories: Categorie[]
}

export function FormationFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
  categories,
}: FormationFormModalProps) {
  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      resolver={zodResolver(formationSchema)}
    >
      {(form) => (
        <>
          <FormField
            type="input"
            name="title"
            label="Titre de la formation *"
            placeholder="Développement Web"
            register={form.register}
            error={form.formState.errors.title?.message}
          />
          <FormField
            type="textarea"
            name="description"
            label="Description (optionnel)"
            placeholder="Description de la formation..."
            register={form.register}
            rows={3}
            error={form.formState.errors.description?.message}
          />
          <div className="grid gap-2">
            <label className="text-sm font-medium">Catégorie *</label>
            <Controller
              name="categorieId"
              control={form.control}
              render={({ field }) => (
                <>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className={form.formState.errors.categorieId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && Array.isArray(categories) && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_category__" disabled>
                          Aucune catégorie disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categorieId && (
                    <p className="text-sm text-destructive">{form.formState.errors.categorieId.message}</p>
                  )}
                </>
              )}
            />
          </div>
          <FormField
            type="input"
            name="imagePath"
            label="URL de l'image (optionnel)"
            placeholder="https://example.com/image.jpg"
            register={form.register}
            error={form.formState.errors.imagePath?.message}
          />
        </>
      )}
    </ModalForm>
  )
}

