// components/admin/apprenants-list.tsx
"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
import { useToast } from "@/hooks/use-toast";
import { UserSelectModal } from "./modals/user-select-modal";
import { UserCreationModal } from "./modals/user-creation-modal";
import { ApprenantFormModal, ApprenantProfileFormData } from "./modals/apprenant-form-modal";
import { UserDb } from "@/models";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";


type ApprenantDisplay = {
  id: number;
  name: string;
  email: string;
  numero?: string;
  status: "Actif" | "Inactif" | "Suspendu"; // Derived from 'activate'
  joinedDate: string; // Derived from 'createdAt'
  filiere: string;
  niveauEtude: string;
  profession: string;
  cohorte?: Cohorte | null;
  avatar?: string; // Apprenant model does not have avatar directly
  coursesEnrolled: number;
  completedCourses: number;
  totalCertificates: number;
}

// Helper function to map Apprenant to ApprenantDisplay
const mapApprenantToApprenantDisplay = (apprenant: Apprenant): ApprenantDisplay => {
  const status: ApprenantDisplay['status'] = apprenant.activate ? "Actif" : "Inactif";
  const joinedDate = apprenant.createdAt 
    ? new Date(apprenant.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) 
    : "";

  return {
    id: apprenant.id || 0,
    name: `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim(),
    email: apprenant.email || "",
    numero: apprenant.numero || "",
    status: status,
    joinedDate: joinedDate,
    filiere: apprenant.filiere || "",
    niveauEtude: apprenant.niveauEtude || "",
    profession: apprenant.profession || "",
    cohorte: apprenant.cohorte || null,
    avatar: undefined,
    coursesEnrolled: 0, // Sera rempli par getApprenantDashboardSummary si disponible
    completedCourses: 0,
    totalCertificates: 0,
  };
};

// Helper function to map ApprenantDisplay to UserFormData
const mapApprenantDisplayToUserFormData = (apprenant: ApprenantDisplay): UserFormData => {
  return {
    nom: apprenant.name.split(' ').length > 1 ? apprenant.name.split(' ')[1] : apprenant.name, // Handle cases where name might be just prenom or nom
    prenom: apprenant.name.split(' ')[0] || "",
    email: apprenant.email,
    numero: apprenant.numero,
    profession: apprenant.profession,
    niveauEtude: apprenant.niveauEtude,
    filiere: apprenant.filiere,
    role: "Apprenant", // Default role for Apprenant, can be made dynamic if needed
    status: apprenant.status,
    cohorteId: apprenant.cohorte?.id,
  };
};

// Helper function to map ApprenantDisplay to UserDisplay for ViewUserModal
const mapApprenantDisplayToUserDisplay = (apprenant: ApprenantDisplay): UserDisplay => {
  return {
    id: apprenant.id,
    name: apprenant.name,
    email: apprenant.email,
    role: "Apprenant", // ApprenantsList only deals with Apprenants
    status: apprenant.status,
    joinedDate: apprenant.joinedDate,
    courses: apprenant.coursesEnrolled,
    avatar: apprenant.avatar,
  };
};


export function ApprenantsList() {
  const { toast } = useToast();
  const userCreationModal = useModal<UserDb>(); // For creating a new user
  const promoteUserModal = useModal<{ userId: number }>(); // For selecting a user to promote
  const promoteProfileFormModal = useModal<{ userId: number, defaultValues: Partial<ApprenantProfileFormData> }>(); // For filling apprenant profile
  const editModal = useModal<ApprenantDisplay>()
  const deleteModal = useModal<ApprenantDisplay>()
  const viewModal = useModal<ApprenantDisplay>()

  const [apprenants, setApprenants] = useState<ApprenantDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  
  // For pagination if needed, similar to UsersList
  // const [currentPage, setCurrentPage] = useState(0);
  // const [pageSize, setPageSize] = useState(10);
  // const [totalElements, setTotalElements] = useState(0);



  const { searchQuery, setSearchQuery, filteredData } = useSearch<ApprenantDisplay>({
    data: apprenants,
    searchKeys: ["name", "email", "filiere", "niveauEtude"],
  });

  // Charger les cohortes au montage
  useEffect(() => {
    const fetchCohortes = async () => {
      try {
        const response = await cohorteService.getAllCohortes();
        setCohortes(Array.isArray(response) ? response : (response?.data || []));
      } catch (err) {
        console.error("Error fetching cohortes:", err);
      }
    };
    fetchCohortes();
  }, []);

  const handleUserSelectedForPromotion = (userId: number) => {
    promoteProfileFormModal.open({ userId, defaultValues: {} });
    promoteUserModal.close();
  };

  const fetchApprenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apprenantService.getAllApprenants();
      // Le service retourne déjà response.data, donc on vérifie directement si c'est un tableau
      const apprenantsData = Array.isArray(response) ? response : (response?.data || []);
      
      if (Array.isArray(apprenantsData) && apprenantsData.length > 0) {
        const apprenantsWithSummary = await Promise.all(
          apprenantsData.map(async (apprenant: Apprenant) => {
            // Mapper l'apprenant avec toutes ses informations
            const mapped = mapApprenantToApprenantDisplay(apprenant);
            // Essayer de récupérer le résumé si possible (peut être optionnel)
            try {
              const summary = apprenant.id ? await apprenantService.getApprenantDashboardSummary(apprenant.id) : null;
              return {
                ...mapped,
                coursesEnrolled: summary?.coursesEnrolled ?? 0,
                completedCourses: summary?.completedCourses ?? 0,
                totalCertificates: summary?.totalCertificates ?? 0,
              };
            } catch {
              // Si le résumé échoue, on garde juste les données de base
              return mapped;
            }
          })
        );
        setApprenants(apprenantsWithSummary);
      } else {
        console.warn("API did not return an array for apprenants:", response);
        setApprenants([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch apprenants.");
      console.error("Error fetching apprenants:", err);
      setApprenants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprenants();
  }, [fetchApprenants]);

  const handlePromoteUserAndCreateProfile = async (promotionData: ApprenantProfileFormData & { userId: number }) => {
    try {
      // Le backend accepte maintenant userId dans ApprenantCreateRequest
      const apprenantData = {
        userId: promotionData.userId,
        nom: promotionData.nom,
        prenom: promotionData.prenom,
        email: promotionData.email,
        numero: promotionData.numero,
        profession: promotionData.profession,
        niveauEtude: promotionData.niveauEtude,
        filiere: promotionData.filiere,
        attentes: promotionData.attentes,
        satisfaction: promotionData.satisfaction,
        cohorteId: promotionData.cohorteId,
        activate: true,
      };

      await apprenantService.createApprenant(apprenantData as any);
      toast({
        title: "Succès",
        description: "L'utilisateur a été promu et le profil apprenant créé.",
      });
      fetchApprenants(); // Rafraîchir la liste
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de promouvoir l'utilisateur en apprenant.",
        variant: "destructive",
      });
      console.error("Error promoting user to apprenant:", err);
    } finally {
      promoteProfileFormModal.close();
    }
  };

  const handleUserCreated = (user: { id: number; fullName: string; email: string }) => {
    toast({
      title: "Utilisateur créé",
      description: `L'utilisateur ${user.fullName} a été créé. Vous pouvez maintenant créer son profil apprenant.`,
    });
    userCreationModal.close();
    promoteProfileFormModal.open({ 
      userId: user.id, 
      defaultValues: {
        email: user.email,
      }
    });
  };

  const handleUpdateApprenant = async (data: UserFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedApprenantData: Partial<Apprenant> = {
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email,
          numero: data.numero,
          profession: data.profession,
          niveauEtude: data.niveauEtude,
          filiere: data.filiere,
          activate: data.status === "Actif",
        };

        // If there's a cohorteId in data, add it to updatedApprenantData
        if (data.cohorteId) {
          // @ts-ignore - cohorte is a full object, but API might expect id
          updatedApprenantData.cohorte = { id: data.cohorteId } as Cohorte;
        } else if (editModal.selectedItem.cohorte) {
           // @ts-ignore
           updatedApprenantData.cohorte = editModal.selectedItem.cohorte;
        }

        const updatedApprenant = await apprenantService.updateApprenant(editModal.selectedItem.id, updatedApprenantData);
        // Le service retourne déjà response.data
        const apprenant = updatedApprenant?.data || updatedApprenant;
        setApprenants((prev) =>
          prev.map((a) =>
            a.id === editModal.selectedItem!.id ? mapApprenantToApprenantDisplay(apprenant) : a
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update apprenant.");
        console.error("Error updating apprenant:", err);
      }
    }
  };

  const handleDeleteApprenant = async (id: number) => {
    setError(null);
    try {
      await apprenantService.deleteApprenant(id);
      toast({
        title: "Succès",
        description: "L'apprenant et l'utilisateur associé ont été supprimés avec succès.",
      });
      setApprenants((prev) => prev.filter((apprenant) => apprenant.id !== id));
      deleteModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to delete apprenant.");
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer l'apprenant.",
        variant: "destructive",
      });
      console.error("Error deleting apprenant:", err);
    }
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
        accessorKey: "numero",
        header: "Téléphone",
        cell: ({ row }) => row.original.numero || "N/A",
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
        accessorKey: "cohorte",
        header: "Cohorte",
        cell: ({ row }) => row.original.cohorte?.nom || "Aucune",
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
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Apprenant
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options d'ajout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => userCreationModal.open()}>
                Créer un nouvel utilisateur
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => promoteUserModal.open()}>
                Promouvoir un utilisateur existant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
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

      {/* UserSelectModal for promoting existing users to apprenant */}
      <UserSelectModal
        open={promoteUserModal.isOpen}
        onOpenChange={(open) => !open && promoteUserModal.close()}
        onSelectUser={handleUserSelectedForPromotion}
        title="Promouvoir un utilisateur en apprenant"
        description="Sélectionnez un utilisateur existant à promouvoir."
        excludeUserIds={apprenants.map(a => a.id)} // Exclude users that are already apprenants
      />

      {/* UserCreationModal for creating a new user */}
      {userCreationModal.isOpen && (
        <UserCreationModal
          open={userCreationModal.isOpen}
          onOpenChange={(open) => !open && userCreationModal.close()}
          onUserCreated={handleUserCreated}
          title="Créer un nouvel utilisateur"
          description="Créez un compte utilisateur de base qui pourra ensuite être promu en apprenant."
          submitLabel="Créer l'utilisateur"
        />
      )}

      {/* ApprenantFormModal for creating/editing apprenant profile */}
      {promoteProfileFormModal.selectedItem && (
        <ApprenantFormModal
          open={promoteProfileFormModal.isOpen}
          onOpenChange={(open) => !open && promoteProfileFormModal.close()}
          onSubmit={handlePromoteUserAndCreateProfile}
          title="Créer le profil apprenant"
          description="Ajoutez les détails spécifiques du profil d'apprenant."
          submitLabel="Créer le profil"
          userId={promoteProfileFormModal.selectedItem.userId}
          defaultValues={promoteProfileFormModal.selectedItem.defaultValues}
          cohortes={cohortes}
        />
      )}

      {/* Modals for Edit, View, Delete */}
      {/* Reusing UserFormModal for Edit */}

      {editModal.selectedItem && (
        <UserFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'apprenant"
          description="Modifiez les informations de l'apprenant"
          defaultValues={mapApprenantDisplayToUserFormData(editModal.selectedItem)}
          onSubmit={handleUpdateApprenant}
          submitLabel="Enregistrer les modifications"
          disableRoleField={true} // Désactiver le champ rôle car on est dans la page Apprenants
          roleDefaultValue="Apprenant" // Valeur par défaut mais le champ sera désactivé
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal // Reusing ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={mapApprenantDisplayToUserDisplay(viewModal.selectedItem)}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={() => handleDeleteApprenant(deleteModal.selectedItem?.id || 0)}
        title="Supprimer l'apprenant"
        description={`Êtes-vous sûr de vouloir supprimer l'apprenant ${deleteModal.selectedItem?.name} ? Cette action supprimera également l'utilisateur de base et toutes ses données associées. Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
