// components/admin/instructeurs-list.tsx
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

import { UserDb } from "@/models"; // Import UserDb model
import { userService } from "@/services"; // Import userService
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state"; // Import EmptyState


type InstructorDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif" | "Suspendu"; // Derived from 'activate'
  joinedDate: string; // Derived from 'createdAt'
  courses: number; // Placeholder
  avatar?: string;
  role: "Instructeur"; // Explicitly set role for display
}

// Helper function to map UserDb to InstructorDisplay
const mapUserDbToInstructorDisplay = (userDb: UserDb): InstructorDisplay => {
  // Assuming 'status' and 'joinedDate' are derived or fixed for now
  // 'courses' count is not directly available, defaulting to 0
  const status: InstructorDisplay['status'] = userDb.activate ? "Actif" : "Inactif"; // Simplified status mapping
  const joinedDate = userDb.createdAt ? new Date(userDb.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

  return {
    id: userDb.id || 0,
    name: userDb.fullName || "",
    email: userDb.email || "",
    status: status,
    joinedDate: joinedDate,
    courses: 0, // Placeholder, as courses are not directly in UserDb
    avatar: userDb.avatar || undefined,
    role: "Instructeur", // Hardcode for instructor list
  };
};


export function InstructeursList() {
  const addModal = useModal<InstructorDisplay>()
  const editModal = useModal<InstructorDisplay>()
  const deleteModal = useModal<InstructorDisplay>()
  const viewModal = useModal<InstructorDisplay>()

  const [instructors, setInstructors] = useState<InstructorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For pagination if needed, similar to UsersList
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);


  useEffect(() => {
    const fetchInstructors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.getAllUsers(currentPage, pageSize);
        // Filter users to get instructors (assuming UserDb.role === "USER" are candidates for instructor/learner)
        const filteredInstructors = response.content.filter(user => user.role === "USER" && !user.admin); // Need a better way to identify instructors
        setInstructors(filteredInstructors.map(mapUserDbToInstructorDisplay));
        setTotalElements(filteredInstructors.length); // Total elements only for this filtered list
      } catch (err: any) {
        setError(err.message || "Failed to fetch instructors.");
        console.error("Error fetching instructors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, [currentPage, pageSize]);


  const { searchQuery, setSearchQuery, filteredData } = useSearch<InstructorDisplay>({
    data: instructors,
    searchKeys: ["name", "email"],
  });

  const handleAddInstructor = (data: UserFormData) => {
    // This needs to call authApiService.signUp with instructor role or similar
    // UserFormModal is designed for UserDisplay type, not InstructorDisplay directly.
    console.log("Add Instructor:", data);
    addModal.close();
  };

  const handleUpdateInstructor = (data: UserFormData) => {
    console.log("Update Instructor:", data);
    editModal.close();
  };

  const handleDeleteInstructor = (id: number) => {
    console.log("Delete Instructor with ID:", id);
    deleteModal.close();
  };

  const columns: ColumnDef<InstructorDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Instructeur",
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
                  onClick: () => viewModal.open(instructor),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(instructor),
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
    [viewModal, editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title="Instructeurs"
        action={{
          label: "Ajouter un instructeur",
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
              title="Aucun instructeur trouvé"
              description="Aucun instructeur ne correspond à votre recherche"
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      {/* Modals for Add, Edit, View, Delete */}
      {/* Reusing UserFormModal for Add/Edit, might need specific InstructorFormModal later */}
      <UserFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un instructeur"
        description="Créez un nouveau compte instructeur sur la plateforme"
        onSubmit={handleAddInstructor}
        submitLabel="Créer l'instructeur"
      />

      {editModal.selectedItem && (
        <UserFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'instructeur"
          description="Modifiez les informations de l'instructeur"
          defaultValues={editModal.selectedItem} // This might need mapping from InstructorDisplay to UserFormData
          onSubmit={handleUpdateInstructor}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal // Reusing ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={viewModal.selectedItem} // This assumes ViewUserModal can handle InstructorDisplay type
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={() => handleDeleteInstructor(deleteModal.selectedItem?.id || 0)}
        title="Supprimer l'instructeur"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
