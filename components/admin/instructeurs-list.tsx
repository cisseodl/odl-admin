// components/admin/instructeurs-list.tsx
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
import { Eye, Edit, Trash2, User, Mail, Calendar, BookOpen, GraduationCap, ChevronDown, Plus } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user"

import { userService } from "@/services";
import { instructorService } from "@/services/instructor.service"; // Import instructorService instance
import type { ApiInstructor } from "@/services/instructor.service"; // Import ApiInstructor as a type
import { UserDb } from "@/models";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/hooks/use-toast";
import { UserSelectModal } from "./modals/user-select-modal";
import { InstructorPromotionFormModal, InstructorProfileFormData } from "./modals/instructor-promotion-form-modal";
import { UserCreationModal } from "./modals/user-creation-modal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


type InstructorDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif" | "Suspendu";
  joinedDate: string;
  courses: number;
  avatar?: string;
  role: "Formateur";
  biography?: string;
  specialization?: string;
}

// Helper function to map UserDb to InstructorDisplay (for cases where we only have UserDb info)
const mapUserDbToInstructorDisplay = (userDb: UserDb): InstructorDisplay => {
  const status: InstructorDisplay['status'] = userDb.activate ? "Actif" : "Inactif";
  const joinedDate = userDb.createdAt ? new Date(userDb.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

  return {
    id: userDb.id || 0,
    name: userDb.fullName || "",
    email: userDb.email || "",
    status: status,
    joinedDate: joinedDate,
    courses: 0,
    avatar: userDb.avatar || undefined,
    role: "Formateur",
  };
};

// Helper function to map ApiInstructor (InstructorWithUserDto) to InstructorDisplay
const mapApiInstructorToInstructorDisplay = (apiInstructor: ApiInstructor): InstructorDisplay => {
  // Le DTO InstructorWithUserDto a les données User directement dans l'objet
  const activate = apiInstructor.userActivate ?? apiInstructor.activate ?? false;
  const status: InstructorDisplay['status'] = activate ? "Actif" : "Inactif";
  
  const joinedDate = apiInstructor.createdAt 
    ? new Date(apiInstructor.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) 
    : "";

  // Utiliser fullName directement depuis le DTO
  const name = apiInstructor.fullName?.trim() 
    || apiInstructor.email?.split('@')[0]
    || "Formateur sans nom";

  return {
    id: apiInstructor.id || 0,
    name: name,
    email: apiInstructor.email || "",
    status: status,
    joinedDate: joinedDate,
    courses: 0,
    avatar: apiInstructor.avatar || undefined,
    role: "Formateur",
    biography: apiInstructor.biography,
    specialization: apiInstructor.specialization,
  };
};

// Helper function to map InstructorDisplay to UserFormData (for UserFormModal for editing user details)
const mapInstructorDisplayToUserFormData = (instructor: InstructorDisplay): UserFormData => {
  const nameParts = instructor.name.split(' ');
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";

  return {
    nom: lastName,
    prenom: firstName,
    email: instructor.email,
    // Ensure to map phone and other UserDb fields if available in InstructorDisplay
    numero: "", // Placeholder or fetch from backend for complete user data
    profession: "",
    niveauEtude: "",
    filiere: "",
    role: "Formateur",
    status: instructor.status,
  };
};

// Helper function to map InstructorDisplay to UserDisplay for ViewUserModal
const mapInstructorDisplayToUserDisplay = (instructor: InstructorDisplay): UserDisplay => {
  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    role: "Formateur",
    status: instructor.status,
    joinedDate: instructor.joinedDate,
    courses: instructor.courses,
    avatar: instructor.avatar,
    biography: instructor.biography,
    specialization: instructor.specialization,
    // Le téléphone pourrait être récupéré depuis la relation user si nécessaire
  };
};

export function InstructeursList() {
  const { toast } = useToast();
  const promoteUserSelectModal = useModal<{ userId: number }>(); // For selecting a user to promote
  const userCreationModal = useModal<UserDb>(); // For creating a new user
  const promoteProfileFormModal = useModal<{ userId: number, defaultValues: Partial<InstructorProfileFormData> }>(); // For filling instructor profile
  const editUserFormModal = useModal<InstructorDisplay>(); // For editing user details of an instructor
  const deleteModal = useModal<InstructorDisplay>();
  const viewModal = useModal<InstructorDisplay>();

  const [instructors, setInstructors] = useState<InstructorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { searchQuery, setSearchQuery, filteredData } = useSearch<InstructorDisplay>({
    data: instructors,
    searchKeys: ["name", "email", "specialization"], // Search by name, email, and specialization for instructors
  });
  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      // Le backend retourne maintenant InstructorWithUserDto avec jointure JPA
      // Les données User (fullName, email, etc.) sont directement dans le DTO
      const response = await instructorService.getAllInstructors();
      const instructorsData = Array.isArray(response) ? response : (response?.data || []);
      
      if (Array.isArray(instructorsData)) {
        setInstructors(instructorsData.map(mapApiInstructorToInstructorDisplay));
      } else {
        console.error("Unexpected response structure:", response);
        setInstructors([]);
        toast({
          title: "Erreur de données",
          description: "La réponse de l'API pour les formateurs est inattendue.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de charger les formateurs.",
        variant: "destructive",
      });
      console.error("Error fetching instructors:", err);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleUserSelectedForPromotion = (userId: number) => {
    promoteProfileFormModal.open({ userId, defaultValues: {} });
    promoteUserSelectModal.close();
  };

  const handlePromoteUserAndCreateProfile = async (promotionData: InstructorProfileFormData & { userId: number }) => {
    try {
      await instructorService.promoteUserAndCreateInstructorProfile(
        promotionData.userId,
        {
          biography: promotionData.biography,
          specialization: promotionData.specialization,
        }
      );
      toast({
        title: "Succès",
        description: "L'utilisateur a été promu et le profil formateur créé.",
      });
      fetchInstructors();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de promouvoir l'utilisateur en formateur.",
        variant: "destructive",
      });
      console.error("Error promoting user to instructor:", err);
    } finally {
      promoteProfileFormModal.close();
    }
  };

  const handleUpdateInstructor = async (data: UserFormData) => {
    if (editUserFormModal.selectedItem) {
      try {
        const instructorId = editUserFormModal.selectedItem.id;
        const updatedUserData: Partial<ApiInstructor & UserDb> = {
          firstName: data.prenom,
          lastName: data.nom,
          email: data.email,
          phone: data.numero,
          activate: data.status === "Actif",
          // biography and specialization are not updated through UserFormModal,
          // they would need a dedicated InstructorProfileFormModal for editing.
        };

        await instructorService.updateInstructor(instructorId, updatedUserData);
        toast({
          title: "Succès",
          description: "Le formateur a été mis à jour.",
        });
        fetchInstructors();
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: err.message || "Impossible de mettre à jour le formateur.",
          variant: "destructive",
        });
        console.error("Error updating instructor:", err);
      } finally {
        editUserFormModal.close();
      }
    }
  };

  const handleDeleteInstructor = async () => {
    if (deleteModal.selectedItem) {
      try {
        await instructorService.deleteInstructor(deleteModal.selectedItem.id!);
        toast({
          title: "Succès",
          description: "Le formateur et l'utilisateur associé ont été supprimés avec succès.",
        });
        fetchInstructors();
      } catch (err: any) {
        toast({
          title: "Erreur",
          description: err.message || "Impossible de supprimer le formateur.",
          variant: "destructive",
        });
        console.error("Error deleting instructor:", err);
      } finally {
        deleteModal.close();
      }
    }
  };

  const handleUserCreated = (user: { id: number; fullName: string; email: string }) => {
    toast({
      title: "Utilisateur créé",
      description: `L'utilisateur ${user.fullName} a été créé. Vous pouvez maintenant le promouvoir en formateur.`,
    });
    userCreationModal.close();
    // Ouvrir directement le formulaire de promotion avec l'utilisateur créé
    promoteProfileFormModal.open({
      userId: user.id,
      defaultValues: {
        email: user.email,
        nom: user.fullName?.split(' ').slice(1).join(' ') || '',
        prenom: user.fullName?.split(' ')[0] || '',
      }
    });
  };

  const columns: ColumnDef<InstructorDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Formateur",
        cell: ({ row }) => {
          const instructor = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={instructor.avatar || "/placeholder.svg"} alt={instructor.name} />
                <AvatarFallback>{instructor.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {instructor.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {instructor.email}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "specialization",
        header: "Spécialisation",
        cell: ({ row }) => row.original.specialization || "N/A",
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
        header: "Formations gérées",
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
          const instructor = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => {
                    viewModal.open(instructor);
                    // Les données de l'instructeur incluent déjà user via mapApiInstructorToInstructorDisplay
                  },
                },
                {
                  label: "Modifier les détails utilisateur",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editUserFormModal.open(instructor),
                },
                {
                  label: "Modifier le profil formateur",
                  icon: <GraduationCap className="h-4 w-4" />,
                  onClick: () => promoteProfileFormModal.open({
                    userId: instructor.id,
                    defaultValues: {
                      biography: instructor.biography,
                      specialization: instructor.specialization,
                    },
                  }),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(instructor),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editUserFormModal, promoteProfileFormModal, deleteModal]
  )

  const instructorIds = useMemo(() => instructors.map(inst => inst.id), [instructors]);

  return (
    <>
      <PageHeader
        title="Formateurs"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Formateur
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options d'ajout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => userCreationModal.open()}>
                Créer un nouvel utilisateur
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => promoteUserSelectModal.open()}>
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
              title="Aucun formateur trouvé"
              description="Aucun formateur ne correspond à votre recherche"
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <UserSelectModal
        open={promoteUserSelectModal.isOpen}
        onOpenChange={(open) => !open && promoteUserSelectModal.close()}
        onSelectUser={handleUserSelectedForPromotion}
        title="Promouvoir un utilisateur en formateur"
        description="Sélectionnez un utilisateur existant à promouvoir."
        excludeUserIds={instructorIds}
      />

      {userCreationModal.isOpen && (
        <UserCreationModal
          open={userCreationModal.isOpen}
          onOpenChange={(open) => !open && userCreationModal.close()}
          onUserCreated={handleUserCreated}
          title="Créer un nouvel utilisateur"
          description="Créez un compte utilisateur de base qui pourra ensuite être promu en formateur."
          submitLabel="Créer l'utilisateur"
        />
      )}

      {promoteProfileFormModal.selectedItem && (
        <InstructorPromotionFormModal
          open={promoteProfileFormModal.isOpen}
          onOpenChange={(open) => !open && promoteProfileFormModal.close()}
          onSubmit={handlePromoteUserAndCreateProfile}
          title="Créer le profil formateur"
          description="Ajoutez les détails spécifiques du profil de formateur."
          submitLabel="Promouvoir et créer le profil"
          userId={promoteProfileFormModal.selectedItem.userId}
          defaultValues={promoteProfileFormModal.selectedItem.defaultValues}
        />
      )}

      {editUserFormModal.selectedItem && (
        <UserFormModal
          open={editUserFormModal.isOpen}
          onOpenChange={(open) => !open && editUserFormModal.close()}
          title="Modifier les détails utilisateur du formateur"
          description="Modifiez les informations de base de l'utilisateur."
          defaultValues={mapInstructorDisplayToUserFormData(editUserFormModal.selectedItem)}
          onSubmit={handleUpdateInstructor}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={mapInstructorDisplayToUserDisplay(viewModal.selectedItem)}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteInstructor}
        title="Supprimer le formateur"
        description={`Êtes-vous sûr de vouloir supprimer le formateur ${deleteModal.selectedItem?.name} ? Cette action supprimera également l'utilisateur de base et toutes ses données associées. Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}