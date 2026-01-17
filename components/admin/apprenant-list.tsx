// components/admin/apprenant-list.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTable } from "@/components/ui/data-table";
import { ActionMenu } from "@/components/ui/action-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useModal } from "@/hooks/use-modal";
import { useSearch } from "@/hooks/use-search";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ViewUserModal } from "./modals/view-user-modal"; // Reusing ViewUserModal
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2, User, Mail, Calendar, GraduationCap, ChevronDown, Plus } from "lucide-react";

import { UserDb, Apprenant, Cohorte } from "@/models"; // Import models
import { apprenantService } from "@/services/apprenant.service";
import { userService } from "@/services"; // For fetching general users to promote
import { cohorteService } from "@/services"; // For fetching cohortes for the form
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/hooks/use-toast";

import { UserSelectModal } from "./modals/user-select-modal";
import { ApprenantFormModal, ApprenantProfileFormData } from "./modals/apprenant-form-modal";
import { UserCreationModal } from "./modals/user-creation-modal"; // Import UserCreationModal
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


type ApprenantDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif";
  joinedDate: string;
  cohorte?: string; // Display cohorte name
  avatar?: string;
  filiere?: string;
  profession?: string;
};

// Helper function to map Apprenant model to ApprenantDisplay
const mapApprenantToApprenantDisplay = (apprenant: Apprenant): ApprenantDisplay => {
  const status: ApprenantDisplay['status'] = apprenant.activate ? "Actif" : "Inactif";
  const joinedDate = apprenant.createdAt ? new Date(apprenant.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

  return {
    id: apprenant.id || 0,
    name: `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim(),
    email: apprenant.email || "",
    status: status,
    joinedDate: joinedDate,
    cohorte: apprenant.cohorte?.nom || "N/A",
    avatar: undefined, // Apprenant model doesn't directly have avatar, assuming userDb relation would provide it
    filiere: apprenant.filiere || "",
    profession: apprenant.profession || "",
  };
};

export function ApprenantList() {
  const { toast } = useToast();
  const promoteUserModal = useModal<{ userId: number }>(); // For selecting a user to promote
  const userCreationModal = useModal<UserDb>(); // For creating a new user
  const apprenantFormModal = useModal<ApprenantProfileFormData & { id?: number }>(); // For filling/editing apprenant profile
  const deleteModal = useModal<ApprenantDisplay>();
  const viewModal = useModal<ApprenantDisplay>();

  const [apprenants, setApprenants] = useState<ApprenantDisplay[]>([]);
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { searchQuery, setSearchQuery, filteredData } = useSearch<ApprenantDisplay>({
    data: apprenants,
    searchKeys: ["name", "email", "filiere", "niveauEtude"],
  });
  
  const fetchApprenants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apprenantService.getAllApprenants();
      if (response.data && Array.isArray(response.data)) {
        setApprenants(response.data.map(mapApprenantToApprenantDisplay));
      } else {
        console.error("Unexpected response structure:", response);
        setApprenants([]);
        toast({
          title: "Erreur de données",
          description: "La réponse de l'API pour les apprenants est inattendue.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch apprenants:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des apprenants.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCohortes = useCallback(async () => {
    try {
      const response = await cohorteService.getAllCohortes(); // Assuming cohorteService.getAllCohortes exists
      if (response.data && Array.isArray(response.data)) {
        setCohortes(response.data);
      } else {
        console.error("Unexpected response structure for cohortes:", response);
        setCohortes([]);
      }
    } catch (error) {
      console.error("Failed to fetch cohortes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des cohortes.",
        variant: "destructive",
      });
    }
  }, [toast]);


  useEffect(() => {
    fetchApprenants();
    fetchCohortes();
  }, [fetchApprenants, fetchCohortes]);

  const handleUserSelectedForApprenantPromotion = (userId: number) => {
    // Open the ApprenantFormModal for this userId
    apprenantFormModal.open({ userId }); // Pass userId to the form
    promoteUserModal.close();
  };

  const handleCreateOrUpdateApprenant = async (data: ApprenantProfileFormData & { userId?: number, id?: number }) => {
    try {
      if (data.id) { // This is an update
        await apprenantService.updateApprenant(data.id, {
          username: data.username,
          numero: data.numero,
          profession: data.profession,
          niveauEtude: data.niveauEtude,
          filiere: data.filiere,
          attentes: data.attentes,
          satisfaction: data.satisfaction,
          cohorteId: data.cohorteId,
        });
        toast({
          title: "Succès",
          description: "Le profil apprenant a été mis à jour.",
        });
      } else { // This is a creation/promotion
        await apprenantService.createApprenant({
          username: data.username,
          userId: data.userId,
          numero: data.numero,
          profession: data.profession,
          niveauEtude: data.niveauEtude,
          filiere: data.filiere,
          attentes: data.attentes,
          satisfaction: data.satisfaction,
          cohorteId: data.cohorteId,
          activate: true,
        });
        toast({
          title: "Succès",
          description: "L'utilisateur a été promu et le profil apprenant créé.",
        });
      }
      fetchApprenants();
    } catch (error: any) {
      console.error("Failed to save apprenant:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le profil apprenant.",
        variant: "destructive",
      });
    } finally {
      apprenantFormModal.close();
    }
  };

  const handleDeleteApprenant = async () => {
    if (!deleteModal.selectedItem) return;
    try {
      await apprenantService.deleteApprenant(deleteModal.selectedItem.id);
      toast({
        title: "Succès",
        description: "Le profil apprenant a été supprimé.",
      });
      fetchApprenants();
    } catch (error) {
      console.error("Failed to delete apprenant:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le profil apprenant.",
        variant: "destructive",
      });
    } finally {
      deleteModal.close();
    }
  };

  const handleUserCreated = (user: { id: number; fullName: string; email: string }) => {
    toast({
      title: "Utilisateur créé",
      description: `L'utilisateur ${user.fullName} a été créé. Vous pouvez maintenant le promouvoir en apprenant.`,
    });
    userCreationModal.close();
    promoteUserModal.open(); // Open selection to promote the new user
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
        accessorKey: "cohorte",
        header: "Cohorte",
        cell: ({ row }) => <div className="text-sm">{row.original.cohorte}</div>,
      },
      {
        accessorKey: "filiere",
        header: "Filière",
        cell: ({ row }) => <div className="text-sm">{row.original.filiere}</div>,
      },
      {
        accessorKey: "profession",
        header: "Profession",
        cell: ({ row }) => <div className="text-sm">{row.original.profession}</div>,
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
                  onClick: () => apprenantFormModal.open({ 
                    id: apprenant.id,
                    username: apprenant.name,
                    numero: apprenant.numero,
                    profession: apprenant.profession,
                    niveauEtude: apprenant.niveauEtude,
                    filiere: apprenant.filiere,
                  }), // Open form for editing
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
    [viewModal, apprenantFormModal, deleteModal]
  )

  const apprenantUserIds = useMemo(() => apprenants.map(app => app.id), [apprenants]);

  return (
    <>
      <PageHeader
        title="Apprenants"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un apprenant <ChevronDown className="ml-2 h-4 w-4" />
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

      <UserSelectModal
        open={promoteUserModal.isOpen}
        onOpenChange={(open) => !open && promoteUserModal.close()}
        onSelectUser={handleUserSelectedForApprenantPromotion}
        title="Promouvoir un utilisateur en apprenant"
        description="Sélectionnez un utilisateur existant pour créer son profil apprenant."
        excludeUserIds={apprenantUserIds} // Exclude users that are already apprenants
      />

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

      {apprenantFormModal.isOpen && (() => {
        const selectedItem = apprenantFormModal.selectedItem;
        // Si c'est une édition, récupérer les données de l'apprenant actuel
        const currentApprenant = selectedItem?.id 
          ? apprenants.find(a => a.id === selectedItem.id)
          : null;
        
        return (
          <ApprenantFormModal
            open={apprenantFormModal.isOpen}
            onOpenChange={(open) => !open && apprenantFormModal.close()}
            onSubmit={handleCreateOrUpdateApprenant}
            title={selectedItem?.id ? "Modifier le profil apprenant" : "Créer le profil apprenant"}
            description={selectedItem?.id ? "Modifiez les détails du profil apprenant." : "Remplissez les détails du profil apprenant pour l'utilisateur sélectionné."}
            submitLabel={selectedItem?.id ? "Enregistrer les modifications" : "Créer le profil"}
            defaultValues={currentApprenant ? {
              username: currentApprenant.name,
              numero: currentApprenant.numero,
              profession: currentApprenant.profession,
              niveauEtude: currentApprenant.niveauEtude,
              filiere: currentApprenant.filiere,
              cohorteId: undefined, // À récupérer depuis les données brutes si nécessaire
            } : (selectedItem || {})}
            userId={selectedItem?.userId || promoteUserModal.selectedItem?.userId}
            cohortes={cohortes}
          />
        );
      })()}

      {viewModal.selectedItem && (
        <ViewUserModal // Reusing ViewUserModal needs a UserDisplay type
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={{
            id: viewModal.selectedItem.id,
            name: viewModal.selectedItem.name,
            email: viewModal.selectedItem.email,
            role: "Apprenant", // Hardcoded for view
            status: viewModal.selectedItem.status,
            joinedDate: viewModal.selectedItem.joinedDate,
            courses: 0, // Placeholder
            avatar: viewModal.selectedItem.avatar,
          }}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteApprenant}
        title="Supprimer le profil apprenant"
        description={`Êtes-vous sûr de vouloir supprimer le profil apprenant de ${deleteModal.selectedItem?.name} ? Cela ne supprime pas l'utilisateur de base.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  );
}