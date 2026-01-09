"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { userSchema, type UserFormData } from "@/lib/validations/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type UserFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => void
  submitLabel?: string
  roleDefaultValue?: UserFormData['role'] // New prop
  disableRoleField?: boolean // New prop
}

export function UserFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
  roleDefaultValue, // Destructure new prop
  disableRoleField, // Destructure new prop
}: UserFormModalProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      ...defaultValues,
      role: roleDefaultValue || defaultValues?.role, // Set default role if provided
    },
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
      resolver={zodResolver(userSchema)}
    >
      {(formInstance) => (
        <>
          <FormField
            type="input"
            name="nom"
            label="Nom"
            placeholder="Traoré"
            register={formInstance.register}
            error={formInstance.formState.errors.nom?.message}
          />
          <FormField
            type="input"
            name="prenom"
            label="Prénom"
            placeholder="Amadou"
            register={formInstance.register}
            error={formInstance.formState.errors.prenom?.message}
          />
          <FormField
            type="input"
            name="email"
            label="Email"
            placeholder="amadou.traore@example.ml"
            inputType="email"
            register={formInstance.register}
            error={formInstance.formState.errors.email?.message}
          />
          <FormField
            type="input"
            name="numero"
            label="Numéro de téléphone (optionnel)"
            placeholder="0123456789"
            register={formInstance.register}
            error={formInstance.formState.errors.numero?.message}
          />
          <FormField
            type="input"
            name="profession"
            label="Profession (optionnel)"
            placeholder="Étudiant, Développeur..."
            register={formInstance.register}
            error={formInstance.formState.errors.profession?.message}
          />
          <FormField
            type="input"
            name="niveauEtude"
            label="Niveau d'étude (optionnel)"
            placeholder="Licence, Master..."
            register={formInstance.register}
            error={formInstance.formState.errors.niveauEtude?.message}
          />
          <FormField
            type="input"
            name="filiere"
            label="Filière (optionnel)"
            placeholder="Informatique, Marketing..."
            register={formInstance.register}
            error={formInstance.formState.errors.filiere?.message}
          />
          <FormField
            type="input"
            name="cohorteId"
            label="ID Cohorte (optionnel)"
            placeholder="1"
            inputType="number"
            register={formInstance.register}
            error={formInstance.formState.errors.cohorteId?.message}
          />
          {!disableRoleField && (
            <FormField
              type="select"
              name="role"
              label="Rôle"
              control={formInstance.control}
              options={[
                { value: "Apprenant", label: "Apprenant" },
                { value: "Instructeur", label: "Formateur" },
                { value: "Admin", label: "Administrateur" },
              ]}
              error={formInstance.formState.errors.role?.message}
            />
          )}
          <FormField
            type="select"
            name="status"
            label="Statut"
            control={formInstance.control}
            options={[
              { value: "Actif", label: "Actif" },
              { value: "Inactif", label: "Inactif" },
              { value: "Suspendu", label: "Suspendu" },
            ]}
            error={formInstance.formState.errors.status?.message}
          />
        </>
      )}
    </ModalForm>
  )
}

