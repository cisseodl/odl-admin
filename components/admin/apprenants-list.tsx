// components/admin/apprenants-list.tsx
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
import { Eye, Edit, Trash2, User, Mail, Calendar, BookOpen, GraduationCap } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user" // Reusing this form data type

import { Apprenant, Cohorte } from "@/models"; // Import Apprenant and Cohorte models
import { apprenantService, cohorteService } from "@/services"; // Import apprenantService and cohorteService
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state"; // Import EmptyState


type ApprenantDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif" | "Suspendu"; // Derived from 'activate'
  joinedDate: string; // Derived from 'createdAt'
  filiere: string;
  niveauEtude: string;
  profession: string;
  cohorte?: Cohorte | null;
  avatar?: string; // Apprenant model does not have avatar directly
}

// Helper function to map Apprenant to ApprenantDisplay
const mapApprenantToApprenantDisplay = (apprenant: Apprenant): ApprenantDisplay => {
  const status: ApprenantDisplay['status'] = apprenant.activate ? "Actif" : "Inactif"; // Simplified status mapping
  const joinedDate = apprenant.createdAt ? new Date(apprenant.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

  return {
    id: apprenant.id || 0,
    name: `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim(),
    email: apprenant.email || "",
    status: status,
    joinedDate: joinedDate,
    filiere: apprenant.filiere || "",
    niveauEtude: apprenant.niveauEtude || "",
    profession: apprenant.profession || "",
    cohorte: apprenant.cohorte,
    avatar: undefined, // Apprenant model does not have avatar directly
  };
};


export function ApprenantsList() {
  const addModal = useModal<ApprenantDisplay>()
  const editModal = useModal<ApprenantDisplay>()
  const deleteModal = useModal<ApprenantDisplay>()
  const viewModal = useModal<ApprenantDisplay>()

  const [apprenants, setApprenants] = useState<ApprenantDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For pagination if needed, similar to UsersList
  // const [currentPage, setCurrentPage] = useState(0);
  // const [pageSize, setPageSize] = useState(10);
  // const [totalElements, setTotalElements] = useState(0);


  useEffect(() => {
    const fetchApprenants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apprenantService.getAllApprenants();
        setApprenants(response.map(mapApprenantToApprenantDisplay));
      } catch (err: any) {
        setError(err.message || "Failed to fetch apprenants.");
        console.error("Error fetching apprenants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApprenants();
  }, []);


  const { searchQuery, setSearchQuery, filteredData } = useSearch<ApprenantDisplay>({
    data: apprenants,
    searchKeys: ["name", "email", "filiere", "niveauEtude"],
  });

  const handleAddApprenant = (data: UserFormData) => {
    // This needs to call apprenantService.createApprenant
    // UserFormModal is designed for UserDisplay type, not ApprenantDisplay directly.
    // Need to adapt UserFormModal or create a specific ApprenantFormModal
    console.log("Add Apprenant:", data);
    addModal.close();
  };

  const handleUpdateApprenant = (data: UserFormData) => {
    console.log("Update Apprenant:", data);
    editModal.close();
  };

  const handleDeleteApprenant = (id: number) => {
    console.log("Delete Apprenant with ID:", id);
    deleteModal.close();
  };

  const columns: ColumnDef<ApprenantDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Apprenant",
        cell: ({ row }) => {
          const apprenant = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={apprenant.avatar || "/placeholder.svg"} alt={apprenant.name} />
                <AvatarFallback>{apprenant.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {apprenant.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {apprenant.email}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "filiere",
        header: "Filière",
      },
      {
        accessorKey: "niveauEtude",
        header: "Niveau d'étude",
      },
      {
        accessorKey: "profession",
        header: "Profession",
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
          const apprenant = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(apprenant),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(apprenant),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(apprenant),
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
        title="Apprenants"
        action={{
          label: "Ajouter un apprenant",
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
              icon={GraduationCap}
              title="Aucun apprenant trouvé"
              description="Aucun apprenant ne correspond à votre recherche"
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      {/* Modals for Add, Edit, View, Delete */}
      {/* Reusing UserFormModal for Add/Edit, might need specific ApprenantFormModal later */}
      <UserFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un apprenant"
        description="Créez un nouveau compte apprenant sur la plateforme"
        onSubmit={handleAddApprenant}
        submitLabel="Créer l'apprenant"
      />

      {editModal.selectedItem && (
        <UserFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'apprenant"
          description="Modifiez les informations de l'apprenant"
          defaultValues={editModal.selectedItem} // This might need mapping from ApprenantDisplay to UserFormData
          onSubmit={handleUpdateApprenant}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal // Reusing ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={viewModal.selectedItem} // This assumes ViewUserModal can handle ApprenantDisplay type
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={() => handleDeleteApprenant(deleteModal.selectedItem?.id || 0)}
        title="Supprimer l'apprenant"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
