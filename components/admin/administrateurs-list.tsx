// components/admin/administrateurs-list.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { UserFormModal } from "@/components/shared/user-form-modal" // Reusing this modal, might need adaptation
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewUserModal } from "./modals/view-user-modal" // Reusing this modal, might need adaptation
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, User, Mail, Calendar, BookOpen, Shield } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user" // Reusing this form data type

import { UserDb } from "@/models"; // Import UserDb model
import { userService } from "@/services"; // Import userService
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state"; // Import EmptyState


type AdministrateurDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif" | "Suspendu"; // Derived from 'activate'
  joinedDate: string; // Derived from 'createdAt'
  courses: number; // Placeholder
  avatar?: string;
  role: "Admin"; // Explicitly set role for display
}

// Helper function to map UserDb to AdministrateurDisplay
const mapUserDbToAdministrateurDisplay = (userDb: UserDb): AdministrateurDisplay => {
  // Assuming 'status' and 'joinedDate' are derived or fixed for now
  // 'courses' count is not directly available, defaulting to 0
  const status: AdministrateurDisplay['status'] = userDb.activate ? "Actif" : "Inactif"; // Simplified status mapping
  const joinedDate = userDb.createdAt ? new Date(userDb.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

  return {
    id: userDb.id || 0,
    name: userDb.fullName || "",
    email: userDb.email || "",
    status: status,
    joinedDate: joinedDate,
    courses: 0, // Placeholder, as courses are not directly in UserDb
    avatar: userDb.avatar || undefined,
    role: "Admin", // Hardcode for admin list
  };
};


export function AdministrateursList() {
  const addModal = useModal<AdministrateurDisplay>()
  const editModal = useModal<AdministrateurDisplay>()
  const deleteModal = useModal<AdministrateurDisplay>()
  const viewModal = useModal<AdministrateurDisplay>()

  const [administrateurs, setAdministrateurs] = useState<AdministrateurDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For pagination if needed, similar to UsersList
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);


  useEffect(() => {
    const fetchAdministrateurs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.getAllUsers(currentPage, pageSize);
        // Filter users to get administrators
        const filteredAdministrateurs = response.content.filter(user => user.admin);
        setAdministrateurs(filteredAdministrateurs.map(mapUserDbToAdministrateurDisplay));
        setTotalElements(filteredAdministrateurs.length); // Total elements only for this filtered list
      } catch (err: any) {
        setError(err.message || "Failed to fetch administrators.");
        console.error("Error fetching administrators:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdministrateurs();
  }, [currentPage, pageSize]);


  const { searchQuery, setSearchQuery, filteredData } = useSearch<AdministrateurDisplay>({
    data: administrateurs,
    searchKeys: ["name", "email"],
  });

  const handleAddAdministrateur = (data: UserFormData) => {
    // This needs to call authApiService.signUp with admin role or similar
    // UserFormModal is designed for UserDisplay type, not AdministrateurDisplay directly.
    console.log("Add Administrateur:", data);
    addModal.close();
  };

  const handleUpdateAdministrateur = (data: UserFormData) => {
    console.log("Update Administrateur:", data);
    editModal.close();
  };

  const handleDeleteAdministrateur = (id: number) => {
    console.log("Delete Administrateur with ID:", id);
    deleteModal.close();
  };

  const columns: ColumnDef<AdministrateurDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Administrateur",
        cell: ({ row }) => {
          const administrateur = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={administrateur.avatar || "/placeholder.svg"} alt={administrateur.name} />
                <AvatarFallback>{administrateur.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {administrateur.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {administrateur.email}
                </div>
              </div>
            </div>
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const administrateur = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(administrateur),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(administrateur),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(administrateur),
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
        title="Administrateurs"
        action={{
          label: "Ajouter un administrateur",
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
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Aucun administrateur trouvé"
              description="Aucun administrateur ne correspond à votre recherche"
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      {/* Modals for Add, Edit, View, Delete */}
      {/* Reusing UserFormModal for Add/Edit, might need specific AdministrateurFormModal later */}
      <UserFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un administrateur"
        description="Créez un nouveau compte administrateur sur la plateforme"
        onSubmit={handleAddAdministrateur}
        submitLabel="Créer l'administrateur"
      />

      {editModal.selectedItem && (
        <UserFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'administrateur"
          description="Modifiez les informations de l'administrateur"
          defaultValues={editModal.selectedItem} // This might need mapping from AdministrateurDisplay to UserFormData
          onSubmit={handleUpdateAdministrateur}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal // Reusing ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={viewModal.selectedItem} // This assumes ViewUserModal can handle AdministrateurDisplay type
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={() => handleDeleteAdministrateur(deleteModal.selectedItem?.id || 0)}
        title="Supprimer l'administrateur"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
