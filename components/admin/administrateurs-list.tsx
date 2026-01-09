// components/admin/administrateurs-list.tsx
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
import { UserFormModal } from "@/components/shared/user-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewUserModal } from "./modals/view-user-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, User, Mail, Calendar, BookOpen, Shield, ChevronDown, Plus } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user"

import { UserDb } from "@/models";
import { userService } from "@/services";
import { adminService } from "@/services/admin.service";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/hooks/use-toast";
import { UserSelectModal } from "./modals/user-select-modal";
import { UserCreationModal } from "./modals/user-creation-modal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // Import Button for DropdownMenuTrigger


type AdministrateurDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif" | "Suspendu";
  joinedDate: string;
  courses: number;
  avatar?: string;
  role: "Admin";
};

// Helper function to map AdminWithUserDto (avec jointure JPA) to AdministrateurDisplay
const mapAdminToAdministrateurDisplay = (adminData: any): AdministrateurDisplay => {
  // Le nouveau DTO AdminWithUserDto a les données User directement dans l'objet (pas dans user)
  // fullName, email, phone, avatar, userActivate sont au niveau racine du DTO
  
  // Debug: log pour voir la structure des données
  if (!adminData.fullName && !adminData.email) {
    console.warn("Admin data without fullName or email:", {
      id: adminData.id,
      userId: adminData.userId,
      fullName: adminData.fullName,
      email: adminData.email,
      allKeys: Object.keys(adminData),
      fullData: adminData
    });
  }
  
  const activate = adminData.userActivate ?? adminData.activate ?? false;
  const status: AdministrateurDisplay['status'] = activate ? "Actif" : "Inactif";
  
  const joinedDate = adminData.createdAt 
    ? new Date(adminData.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) 
    : "";
  
  // Utiliser fullName directement depuis le DTO (pas depuis user.fullName)
  // Essayer aussi user.fullName au cas où la structure serait différente
  // Vérifier aussi si fullName est null vs undefined vs empty string
  const fullName = (adminData.fullName && adminData.fullName.trim()) 
    || (adminData.user?.fullName && adminData.user.fullName.trim())
    || "";
  
  const email = adminData.email || adminData.user?.email || "";
  
  // Construire le nom : utiliser fullName, sinon extraire de l'email, sinon message par défaut
  let name = fullName;
  if (!name && email) {
    name = email.split('@')[0];
  }
  if (!name) {
    name = "Utilisateur sans nom";
    // Si on a un userId, on peut au moins afficher quelque chose
    if (adminData.userId) {
      name = `Utilisateur #${adminData.userId}`;
    }
  }

  return {
    id: adminData.id || 0,
    name: name,
    email: email,
    status: status,
    joinedDate: joinedDate,
    courses: 0,
    avatar: adminData.avatar || adminData.user?.avatar || undefined,
    role: "Admin",
  };
};

// Legacy function name for backward compatibility
const mapUserDbToAdministrateurDisplay = mapAdminToAdministrateurDisplay;

// Helper function to map AdministrateurDisplay to UserFormData (for UserFormModal)
const mapAdministrateurDisplayToUserFormData = (administrateur: AdministrateurDisplay): UserFormData => {
  const nameParts = administrateur.name.split(' ');
  const prenom = nameParts[0] || "";
  const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";

  return {
    nom: nom,
    prenom: prenom,
    email: administrateur.email,
    numero: "",
    profession: "",
    niveauEtude: "",
    filiere: "",
    role: "Admin",
    status: administrateur.status,
  };
};

// Helper function to map AdministrateurDisplay to UserDisplay for ViewUserModal
const mapAdministrateurDisplayToUserDisplay = (administrateur: AdministrateurDisplay, userDb?: UserDb): UserDisplay => {
  return {
    id: administrateur.id,
    name: administrateur.name,
    email: administrateur.email,
    role: "Admin",
    status: administrateur.status,
    joinedDate: administrateur.joinedDate,
    courses: administrateur.courses,
    avatar: administrateur.avatar,
    phone: userDb?.phone || undefined,
  };
};


export function AdministrateursList() {
  const { toast } = useToast();
  const promoteUserModal = useModal<UserDb>(); // Use for promoting existing users
  const userCreationModal = useModal<UserDb>(); // For creating a new user
  const editModal = useModal<AdministrateurDisplay>();
  const deleteModal = useModal<AdministrateurDisplay>();
  const viewModal = useModal<AdministrateurDisplay>();

  const [administrateurs, setAdministrateurs] = useState<AdministrateurDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalUserData, setViewModalUserData] = useState<UserDb | null>(null);
  const [rawAdminsData, setRawAdminsData] = useState<any[]>([]); // Stocker les données brutes pour extraire userId
  
  const { searchQuery, setSearchQuery, filteredData } = useSearch<AdministrateurDisplay>({
    data: administrateurs,
    searchKeys: ["name", "email"], // Search by name and email for administrators
  });
  const fetchAdministrateurs = useCallback(async () => {
    setLoading(true);
    try {
      // Le backend retourne maintenant AdminWithUserDto avec jointure JPA
      // Les données User (fullName, email, etc.) sont directement dans le DTO
      const response = await adminService.getAllAdmins();
      
      // Debug: log la réponse complète pour voir la structure
      console.log("Raw response from getAllAdmins:", response);
      
      // Le service retourne déjà response.data || response
      // Si c'est un tableau, l'utiliser directement
      // Sinon, essayer d'extraire response.data
      let adminsData: any[] = [];
      
      if (Array.isArray(response)) {
        adminsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        adminsData = response.data;
      } else if (response?.ok && response?.data && Array.isArray(response.data)) {
        adminsData = response.data;
      } else {
        console.error("Unexpected response structure for getAllAdmins:", response);
        console.error("Response type:", typeof response);
        console.error("Response keys:", Object.keys(response || {}));
        toast({
          title: "Erreur de données",
          description: "La réponse de l'API pour les administrateurs est inattendue.",
          variant: "destructive",
        });
        setAdministrateurs([]);
        return;
      }
      
      // Debug: log tous les admins pour voir la structure
      console.log("Extracted adminsData:", adminsData);
      adminsData.forEach((admin, index) => {
        console.log(`Admin ${index}:`, {
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          userId: admin.userId,
          user: admin.user,
          allKeys: Object.keys(admin)
        });
      });
      
      // Sauvegarder les données brutes pour extraire les userIds
      setRawAdminsData(adminsData);
      setAdministrateurs(adminsData.map(mapAdminToAdministrateurDisplay));
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de charger la liste des administrateurs.",
        variant: "destructive",
      });
      console.error("Error fetching administrators:", err);
      setAdministrateurs([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdministrateurs();
  }, [fetchAdministrateurs]);

  const handlePromoteUserToAdmin = async (userId: number) => {
    try {
      await adminService.promoteUserToAdmin(userId);
      toast({
        title: "Succès",
        description: "L'utilisateur a été promu administrateur avec succès.",
      });
      fetchAdministrateurs();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de promouvoir l'utilisateur en administrateur.",
        variant: "destructive",
      });
      console.error("Error promoting user to admin:", err);
    } finally {
      promoteUserModal.close();
    }
  };

  const handleUpdateAdministrateur = async (data: UserFormData) => {
    if (editModal.selectedItem) {
      try {
        const adminId = editModal.selectedItem.id;
        const updatedAdminData: Partial<UserDb> = {
          fullName: `${data.prenom || ''} ${data.nom || ''}`.trim(),
          email: data.email,
          phone: data.numero || "",
          activate: data.status === "Actif",
        };

        await adminService.updateAdmin(adminId, updatedAdminData);
        toast({
          title: "Succès",
          description: "L'administrateur a été mis à jour.",
        });
        fetchAdministrateurs();
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: err.message || "Impossible de mettre à jour l'administrateur.",
          variant: "destructive",
        });
        console.error("Error updating administrator:", err);
      } finally {
        editModal.close();
      }
    }
  };

  const handleDeleteAdministrateur = async () => {
    if (deleteModal.selectedItem) {
      try {
        await adminService.deleteAdmin(deleteModal.selectedItem.id);
        toast({
          title: "Succès",
          description: "L'administrateur et l'utilisateur associé ont été supprimés avec succès.",
        });
        fetchAdministrateurs();
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: err.message || "Impossible de supprimer l'administrateur.",
          variant: "destructive",
        });
        console.error("Error deleting administrator:", err);
      } finally {
        deleteModal.close();
      }
    }
  };

  const handleUserCreated = (user: { id: number; fullName: string; email: string }) => {
    toast({
      title: "Utilisateur créé",
      description: `L'utilisateur ${user.fullName} a été créé. Vous pouvez maintenant le promouvoir en administrateur.`,
    });
    userCreationModal.close();
    // Ouvrir le modal de sélection pour permettre à l'admin de choisir l'utilisateur à promouvoir
    // L'utilisateur créé apparaîtra dans la liste des utilisateurs disponibles
    promoteUserModal.open();
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
        accessorKey: "courses",
        header: "Cours gérés",
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
          const administrateur = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: async () => {
                    viewModal.open(administrateur);
                    // Charger les détails complets de l'admin avec la relation user
                    try {
                      const adminDetails = await adminService.getAdminById(administrateur.id);
                      const admin = adminDetails?.data || adminDetails;
                      // Extraire l'objet user de la réponse
                      const userData = admin?.user || admin;
                      setViewModalUserData(userData || null);
                    } catch (err) {
                      console.error("Error fetching admin details:", err);
                      setViewModalUserData(null);
                    }
                  },
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

  // Extraire les userIds depuis les données brutes AdminWithUserDto
  const adminUserIds = useMemo(() => {
    return rawAdminsData
      .map((admin: any) => admin.userId)
      .filter((id: any): id is number => id != null && typeof id === 'number');
  }, [rawAdminsData]);

  return (
    <>
      <PageHeader
        title="Administrateurs"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Administrateur
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

      {/* UserSelectModal for promoting existing users to admin */}
      <UserSelectModal
        open={promoteUserModal.isOpen}
        onOpenChange={(open) => !open && promoteUserModal.close()}
        onSelectUser={handlePromoteUserToAdmin}
        title="Promouvoir un utilisateur en administrateur"
        description="Sélectionnez un utilisateur existant à promouvoir."
        excludeUserIds={adminUserIds} // Exclude users that are already admins (use userId, not admin.id)
      />

      {/* UserCreationModal for creating a new user */}
      <UserCreationModal
        open={userCreationModal.isOpen}
        onOpenChange={(open) => !open && userCreationModal.close()}
        onUserCreated={handleUserCreated}
        title="Créer un nouvel utilisateur"
        description="Créez un compte utilisateur de base qui pourra ensuite être promu."
        submitLabel="Créer l'utilisateur"
      />

      {editModal.selectedItem && (
        <UserFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'administrateur"
          description="Modifiez les informations de l'administrateur"
          defaultValues={mapAdministrateurDisplayToUserFormData(editModal.selectedItem)}
          onSubmit={handleUpdateAdministrateur}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              viewModal.close();
              setViewModalUserData(null);
            }
          }}
          user={mapAdministrateurDisplayToUserDisplay(viewModal.selectedItem, viewModalUserData || undefined)}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteAdministrateur}
        title="Supprimer l'administrateur"
        description={`Êtes-vous sûr de vouloir supprimer l'administrateur ${deleteModal.selectedItem?.name} ? Cette action supprimera également l'utilisateur de base et toutes ses données associées. Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}