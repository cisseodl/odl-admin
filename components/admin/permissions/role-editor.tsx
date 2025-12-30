"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PermissionEngine } from "@/lib/permissions/permission-engine"
import type { Role, PermissionResource, PermissionAction } from "@/types/permissions"

type RoleFormData = {
  name: string
  description: string
  permissions: { resource: PermissionResource; actions: PermissionAction[] }[]
}

type RoleEditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role
  onSubmit: (data: Omit<Role, "id" | "createdAt">) => void
}

const RESOURCES: { value: PermissionResource; label: string }[] = [
  { value: "users", label: "Utilisateurs" },
  { value: "courses", label: "Formations" },
  { value: "instructors", label: "Instructeurs" },
  { value: "categories", label: "Catégories" },
  { value: "certifications", label: "Certifications" },
  { value: "content", label: "Contenus" },
  { value: "badges", label: "Badges" },
  { value: "announcements", label: "Annonces" },
  { value: "reviews", label: "Avis" },
  { value: "reports", label: "Rapports" },
  { value: "settings", label: "Paramètres" },
]

const ACTIONS: { value: PermissionAction; label: string }[] = [
  { value: "create", label: "Créer" },
  { value: "read", label: "Lire" },
  { value: "update", label: "Modifier" },
  { value: "delete", label: "Supprimer" },
  { value: "moderate", label: "Modérer" },
]

export function RoleEditor({ open, onOpenChange, role, onSubmit }: RoleEditorProps) {
  const [permissions, setPermissions] = useState<
    { resource: PermissionResource; actions: PermissionAction[] }[]
  >([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string; description: string }>({
    defaultValues: role
      ? {
          name: role.name,
          description: role.description,
        }
      : {
          name: "",
          description: "",
        },
  })

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description,
      })
      setPermissions(role.permissions)
    } else {
      reset({
        name: "",
        description: "",
      })
      setPermissions([])
    }
  }, [role, reset])

  const togglePermission = (resource: PermissionResource, action: PermissionAction) => {
    setPermissions((prev) => {
      const resourcePerm = prev.find((p) => p.resource === resource)
      if (resourcePerm) {
        const hasAction = resourcePerm.actions.includes(action)
        if (hasAction) {
          const newActions = resourcePerm.actions.filter((a) => a !== action)
          if (newActions.length === 0) {
            return prev.filter((p) => p.resource !== resource)
          }
          return prev.map((p) =>
            p.resource === resource ? { ...p, actions: newActions } : p
          )
        } else {
          return prev.map((p) =>
            p.resource === resource ? { ...p, actions: [...p.actions, action] } : p
          )
        }
      } else {
        return [...prev, { resource, actions: [action] }]
      }
    })
  }

  const onFormSubmit = (data: { name: string; description: string }) => {
    const roleData: Omit<Role, "id" | "createdAt"> = {
      name: data.name,
      description: data.description,
      permissions,
      isSystem: false,
    }

    const validation = PermissionEngine.validateRole(roleData)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    onSubmit(roleData)
    onOpenChange(false)
  }

  const isActionChecked = (resource: PermissionResource, action: PermissionAction) => {
    const resourcePerm = permissions.find((p) => p.resource === resource)
    return resourcePerm?.actions.includes(action) || false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-tight">
            {role ? "Modifier le rôle" : "Créer un nouveau rôle"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Configurez les permissions pour ce rôle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du rôle *</Label>
              <Input
                id="name"
                {...register("name", { required: "Le nom est requis" })}
                placeholder="Ex: Modérateur"
                className={errors.name ? "border-destructive" : ""}
                disabled={role?.isSystem}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description", { required: "La description est requise" })}
                placeholder="Décrivez le rôle..."
                rows={3}
                className={errors.description ? "border-destructive" : ""}
                disabled={role?.isSystem}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Permissions</Label>
            <div className="border rounded-lg p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {RESOURCES.map((resource) => (
                <div key={resource.value} className="space-y-2 pb-4 border-b last:border-0">
                  <Label className="font-medium">{resource.label}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {ACTIONS.map((action) => (
                      <div key={action.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${resource.value}-${action.value}`}
                          checked={isActionChecked(resource.value, action.value)}
                          onCheckedChange={() => togglePermission(resource.value, action.value)}
                          disabled={role?.isSystem}
                        />
                        <Label
                          htmlFor={`${resource.value}-${action.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {action.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={role?.isSystem}>
              {role ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

