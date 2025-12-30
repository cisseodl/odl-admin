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
import { InstructorFormModal } from "@/components/shared/instructor-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewInstructorModal } from "./modals/view-instructor-modal"
import { PageLoader } from "@/components/ui/page-loader"
import { userService } from "@/services/user.service" // Keep for future user management, if needed.
import { instructorService, type ApiInstructor } from "@/services/instructor.service"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Mail, BookOpen, Users, Star, GraduationCap } from "lucide-react"
import type { InstructorFormData } from "@/lib/validations/instructor"

// Type for the flat data structure required by the UI
type Instructor = {
  id: number
  name: string
  email: string
  phone: string
  specialization: string
  courses: number // Placeholder - API does not provide this
  students: number // Placeholder - API does not provide this
  rating: number // Placeholder - API does not provide this
  status: "Actif" | "Inactif"
  joinedDate: string
  avatar?: string
}

/**
 * Maps the ApiInstructor object from the API to the flat Instructor structure required by the UI.
 * @param apiInstructor The instructor object from the API.
 * @returns A flat Instructor object.
 */
const mapApiInstructorToInstructor = (apiInstructor: ApiInstructor): Instructor => {
  let joinedDate = "N/A";
  if (apiInstructor.createdAt) {
    // Replace space with 'T' to make it a valid ISO 8601 string for the Date constructor
    const compliantDateStr = apiInstructor.createdAt.replace(" ", "T");
    const date = new Date(compliantDateStr);
    // Check if the created date is valid before trying to format it
    if (!isNaN(date.getTime())) {
      joinedDate = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    }
  }

  return {
    id: apiInstructor.id,
    name: `${apiInstructor.firstName} ${apiInstructor.lastName}`,
    email: apiInstructor.email,
    phone: apiInstructor.phone,
    specialization: apiInstructor.qualifications || "Non spécifiée",
    courses: 0, // Placeholder - API does not provide this
    students: 0, // Placeholder - API does not provide this
    rating: 0, // Placeholder - API does not provide this
    status: apiInstructor.activate ? "Actif" : "Inactif",
    joinedDate: joinedDate,
    avatar: apiInstructor.imagePath || "/placeholder.svg",
  }
}

export function InstructorsList() {
  const addModal = useModal<Instructor>()
  const editModal = useModal<Instructor>()
  const deleteModal = useModal<Instructor>()
  const viewModal = useModal<Instructor>()

  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Instructor>({
    data: instructors,
    searchKeys: ["name", "email", "specialization"],
  })


  // TODO: These handlers need to be updated to make API calls instead of just modifying local state.
  const handleAddInstructor = (data: InstructorFormData) => {
    // This should call `userService.createUser` or similar, then refetch or update state
    console.log("Adding instructor:", data)
    // For now, we optimistically update the UI, but this is not ideal.
  }

  const handleUpdateInstructor = (data: InstructorFormData) => {
    // This should call a `userService.updateUser` method
    console.log("Updating instructor:", data)
  }

  const handleDeleteInstructor = () => {
    // This should call a `userService.deleteUser` method
    if (deleteModal.selectedItem) {
      console.log("Deleting instructor:", deleteModal.selectedItem.id)
    }
  }

  const columns: ColumnDef<Instructor>[] = useMemo(
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
                <div className="font-medium">{instructor.name}</div>
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            {row.original.specialization}
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
        accessorKey: "students",
        header: "Apprenants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students}
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: "Note",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
  
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstructors = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiInstructors = await instructorService.getAllInstructors();
        setInstructors(apiInstructors.map(mapApiInstructorToInstructor));
      } catch (err: any) {
        setError("Impossible de charger les instructeurs. (" + (err.message || "Erreur inconnue") + ")");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Instructor>({
    data: instructors,
    searchKeys: ["name", "email", "specialization"],
  })


  // TODO: These handlers need to be updated to make API calls instead of just modifying local state.
  const handleAddInstructor = (data: InstructorFormData) => {
    // This should call `userService.createUser` or similar, then refetch or update state
    console.log("Adding instructor:", data)
    // For now, we optimistically update the UI, but this is not ideal.
  }

  const handleUpdateInstructor = async (data: InstructorFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedInstructorData: Partial<ApiInstructor> = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone, // Now available in form data
          bio: data.bio, // Now available in form data
          qualifications: data.qualifications, // Renamed
          imagePath: data.imagePath || editModal.selectedItem.avatar, // Use new path if provided, else keep old
          activate: editModal.selectedItem.status === "Actif", // Preserve existing status from display type
        };
        await instructorService.updateInstructor(editModal.selectedItem.id, updatedInstructorData);
        // Refresh the list to show updated data
        // A full refetch is safer, but if API returns updated object, map it back
        setInstructors(prev => prev.map(inst =>
          inst.id === editModal.selectedItem!.id ? { ...mapApiInstructorToInstructor(updatedInstructorData as ApiInstructor), id: inst.id } : inst
        ));
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update instructor.");
        console.error("Error updating instructor:", err);
      }
    }
  }

  const handleDeleteInstructor = () => {
    // This should call a `userService.deleteUser` method
    if (deleteModal.selectedItem) {
      console.log("Deleting instructor:", deleteModal.selectedItem.id)
    }
  }

  const columns: ColumnDef<Instructor>[] = useMemo(
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
                <div className="font-medium">{instructor.name}</div>
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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            {row.original.specialization}
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
        accessorKey: "students",
        header: "Apprenants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students}
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: "Note",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
  
  if (loading) {
    return (
      <>
        <PageHeader title="Instructeurs" />
        <PageLoader />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader title="Instructeurs" />
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </>
    )
  }

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
              placeholder="Rechercher un instructeur..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {filteredData.length === 0 && !loading && !error ? ( // Check if no results after filtering AND not loading/error
            <div className="text-center text-muted-foreground p-4">
              Aucun instructeur trouvé.
            </div>
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <InstructorFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un instructeur"
        description="Créez un nouveau compte instructeur sur la plateforme"
        onSubmit={handleAddInstructor}
        submitLabel="Créer l'instructeur"
      />

      {editModal.selectedItem && (
        <InstructorFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'instructeur"
          description="Modifiez les informations de l'instructeur"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateInstructor}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewInstructorModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          instructor={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteInstructor}
        title="Supprimer l'instructeur"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
