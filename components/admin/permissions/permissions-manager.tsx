"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { SearchBar } from "@/components/ui/search-bar"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { RoleEditor } from "./role-editor"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, Shield, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Role } from "@/types/permissions"

export function PermissionsManager() {
  const addModal = useModal<Role>()
  const editModal = useModal<Role>()
  const deleteModal = useModal<Role>()

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: "admin",
      description: "Administrateur avec tous les droits",
      permissions: [],
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "instructor",
      description: "Instructeur avec droits limités",
      permissions: [
        { resource: "courses", actions: ["create", "read", "update"] },
        { resource: "content", actions: ["create", "read", "update"] },
        { resource: "reviews", actions: ["read"] },
      ],
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 3,
      name: "moderator",
      description: "Modérateur de contenu",
      permissions: [
        { resource: "content", actions: ["read", "moderate"] },
        { resource: "reviews", actions: ["read", "moderate"] },
        { resource: "courses", actions: ["read", "moderate"] },
      ],
      isSystem: false,
      createdAt: "2024-01-15T10:00:00Z",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Role>({
    data: roles,
    searchKeys: ["name", "description"],
  })

  const handleAddRole = (data: Omit<Role, "id" | "createdAt">) => {
    const newRole: Role = {
      ...data,
      id: roles.length + 1,
      createdAt: new Date().toISOString(),
    }
    setRoles([...roles, newRole])
  }

  const handleUpdateRole = (data: Omit<Role, "id" | "createdAt">) => {
    if (editModal.selectedItem) {
      setRoles(
        roles.map((role) =>
          role.id === editModal.selectedItem!.id
            ? {
                ...editModal.selectedItem,
                ...data,
              }
            : role
        )
      )
    }
  }

  const handleDeleteRole = () => {
    if (deleteModal.selectedItem) {
      setRoles(roles.filter((role) => role.id !== deleteModal.selectedItem!.id))
    }
  }

  const getPermissionCount = (role: Role) => {
    return role.permissions.reduce((total, perm) => total + perm.actions.length, 0)
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.original
        return (
          <div>
            <div className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {role.name}
              {role.isSystem && (
                <Badge variant="secondary" className="text-xs">
                  Système
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{role.description}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const count = getPermissionCount(row.original)
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{count} permission{count > 1 ? "s" : ""}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original
        const actions = []

        if (!role.isSystem) {
          actions.push({
            label: "Modifier",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => editModal.open(role),
          })
          actions.push({
            label: "Supprimer",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => deleteModal.open(role),
            variant: "destructive" as const,
          })
        }

        return <ActionMenu actions={actions} />
      },
    },
  ]

  return (
    <>
      <PageHeader
        title="Gestion des Permissions"
        description="Configurez les rôles et permissions des utilisateurs"
        action={{
          label: "Créer un rôle",
          onClick: () => addModal.open(),
        }}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <SearchBar placeholder="Rechercher un rôle..." value={searchQuery} onChange={setSearchQuery} />
          </div>
          <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
        </CardContent>
      </Card>

      <RoleEditor
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        onSubmit={handleAddRole}
      />

      {editModal.selectedItem && (
        <RoleEditor
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          role={editModal.selectedItem}
          onSubmit={handleUpdateRole}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteRole}
        title="Supprimer le rôle"
        description={`Êtes-vous sûr de vouloir supprimer le rôle "${deleteModal.selectedItem?.name}" ?`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}

