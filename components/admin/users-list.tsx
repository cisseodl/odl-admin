"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { UserFormModal } from "@/components/shared/user-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewUserModal } from "./modals/view-user-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, User, GraduationCap, Shield, Mail, Calendar, BookOpen } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user"

import { UserDb } from "@/models"; // Import UserDb from models/index.ts
import { userService } from "@/services"; // Import userService from services/index.ts
import { apprenantService } from "@/services/apprenant.service"; // Import apprenantService
import { useEffect, useCallback } from "react"; // Import useCallback
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader

type UserDisplay = {
  id: number;
  name: string;
  email: string;
  role: "Apprenant" | "Instructeur" | "Admin";
  status: "Actif" | "Inactif" | "Suspendu"; // This might need mapping from backend 'activate'
  joinedDate: string; // This might need mapping from backend 'createdAt'
  courses: number; // This is not directly in UserDb, might be from Apprenant
  avatar?: string;
};

// Helper function to map UserDb to UserDisplay
const mapUserDbToUserDisplay = (userDb: UserDb): UserDisplay => {
  let displayRole: UserDisplay['role'];

  switch (userDb.role) {
    case "ADMIN":
      displayRole = "Admin";
      break;
    case "INSTRUCTOR":
      displayRole = "Instructeur";
      break;
    case "USER": // Assuming "USER" role maps to "Apprenant"
      displayRole = "Apprenant";
      break;
    default:
      displayRole = "Apprenant"; // Default to learner if role is unknown
  }

  const status: UserDisplay['status'] = userDb.activate ? "Actif" : "Inactif";
  
  let joinedDate = "";
  if (userDb.createdAt) {
    const compliantDateStr = userDb.createdAt.replace(" ", "T");
    const date = new Date(compliantDateStr);
    if (!isNaN(date.getTime())) {
      joinedDate = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    }
  }

  return {
    id: userDb.id || 0, // Assuming ID will always be present for fetched users
    name: userDb.fullName || "",
    email: userDb.email || "",
    role: displayRole,
    status: status,
    joinedDate: joinedDate,
    courses: 0, // Placeholder, as courses are not directly in UserDb
    avatar: userDb.avatar || undefined,
  };
};

export function UsersList() {
  const addModal = useModal<UserDisplay>();
  const editModal = useModal<UserDisplay>();
  const deleteModal = useModal<UserDisplay>();
  const viewModal = useModal<UserDisplay>();

  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers(currentPage, pageSize);
      setUsers(response.content.map(mapUserDbToUserDisplay));
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const { searchQuery, setSearchQuery, filteredData } = useSearch<UserDisplay>({
    data: users,
    searchKeys: ["name", "email"],
  });

  const handleAddUser = (data: UserFormData) => {
    // This needs to call authApiService.signUp or authApiService.createLearnerByAdmin
    // For now, keeping as mock/placeholder
    const newUser: UserDisplay = {
      id: users.length + 1,
      name: data.name,
      email: data.email,
      role: data.role,
      status: "Actif", // Default status
      joinedDate: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
      courses: 0, // Placeholder
      avatar: undefined,
    };
    setUsers((prev) => [...prev, newUser]);
    addModal.close();
  };

  const handleUpdateUser = async (data: UserFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const userId = editModal.selectedItem.id;
        // Map UserFormData to Partial<Apprenant> for update
        const apprenantData: Partial<Apprenant> = {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          numero: data.numero,
          profession: data.profession,
          niveauEtude: data.niveauEtude,
          filiere: data.filiere,
          cohorte: data.cohorteId ? { id: data.cohorteId } : undefined, // Map cohorteId to { id: number }
          // activate: editModal.selectedItem.status === "Actif", // Preserve existing status
        };
        await apprenantService.updateApprenant(userId, apprenantData);
        await fetchUsers(); // Refresh the list
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update user.");
        console.error("Error updating user:", err);
      }
    }
  };

  const handleDeleteUser = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await apprenantService.deleteApprenant(deleteModal.selectedItem.id);
        await fetchUsers(); // Refresh the list
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete user.");
        console.error("Error deleting user:", err);
      }
    }
  };

  const columns: ColumnDef<UserDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Utilisateur",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {user.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "role",
        header: "Rôle",
        cell: ({ row }) => {
          const role = row.original.role
          return (
            <StatusBadge
              status={role}
              variant={role === "Admin" ? "default" : "secondary"} // Simplified: Admin is default, others (Apprenant) are secondary
            />
          )
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "joinedDate",
        header: "Date d'inscription",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.joinedDate}
          </div>
        ),
      },
      {
        accessorKey: "courses",
        header: "Formations",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.courses}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(user),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(user),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(user),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        action={{
          label: "Ajouter un utilisateur",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader /> // Or a skeleton loader
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>
      <UserFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un utilisateur"
        description="Créez un nouveau compte utilisateur sur la plateforme"
        onSubmit={handleAddUser}
        submitLabel="Créer l'utilisateur"
        roleDefaultValue="Apprenant" // Default role for new users
        disableRoleField={true} // Disable role selection for new users here
      />

      {editModal.selectedItem && (
        <UserFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'utilisateur"
          description="Modifiez les informations de l'utilisateur"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateUser}
          submitLabel="Enregistrer les modifications"
          roleDefaultValue={editModal.selectedItem.role} // Pass existing role as default
          disableRoleField={true} // Disable role selection for existing users here
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteUser}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
