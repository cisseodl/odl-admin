"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, FileText, Video, Image, FileQuestion, File, Calendar, Clock, HardDrive } from "lucide-react"

import { LabDefinition } from "@/models"; // Import LabDefinition from models/index.ts
import { labDefinitionService } from "@/services"; // Import labDefinitionService from services/index.ts

import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "./empty-state";

// Import LabFormModal and LabFormData
import { LabFormModal } from "@/components/shared/lab-form-modal";
import { LabFormData } from "@/lib/validations/lab";


type ContentDisplay = {
  id: number
  title: string
  type: "Vidéo" | "Document" | "Image" | "Quiz" | "Fichier" | "Lab"
  course: string // Will be placeholder for Lab
  module?: string // Will be placeholder for Lab
  duration?: string // Derived from estimated_duration_minutes for Lab
  size?: string // Will be placeholder for Lab
  uploadDate: string // Derived from createdAt for Lab
  status: "Publié" | "Brouillon" // Derived from activate for Lab
  // Champs spécifiques aux labs pour l'édition et l'affichage des détails
  description?: string;
  dockerImageName?: string;
  estimatedDurationMinutes?: number;
  instructions?: string;
  activate?: boolean;
}

// Helper function to map LabDefinition to ContentDisplay
const mapLabDefinitionToContentDisplay = (lab: LabDefinition): ContentDisplay => {
  return {
    id: lab.id || 0,
    title: lab.title,
    type: "Lab", // Hardcode type for LabDefinition
    course: "Lab Course", // Placeholder, as not in LabDefinition model
    module: "Lab Module", // Placeholder, as not in LabDefinition model
    duration: lab.estimated_duration_minutes ? `${lab.estimated_duration_minutes} min` : "N/A",
    size: "N/A", // Placeholder, as not in LabDefinition model
    uploadDate: lab.createdAt ? new Date(lab.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "",
    status: lab.activate ? "Publié" : "Brouillon", // Assuming activate maps to status
    description: lab.description || "",
    dockerImageName: lab.docker_image_name || "",
    estimatedDurationMinutes: lab.estimated_duration_minutes,
    instructions: lab.instructions || "",
    activate: lab.activate,
  };
};

// Helper function to map ContentDisplay to LabFormData for editing
const mapContentDisplayToLabFormData = (content: ContentDisplay): LabFormData => {
  return {
    title: content.title,
    description: content.description || "",
    dockerImageName: content.dockerImageName || "",
    estimatedDurationMinutes: content.estimatedDurationMinutes || 0,
    instructions: content.instructions || "",
    activate: content.activate || false,
  };
};


export function LabsManager() {
  const addModal = useModal<ContentDisplay>()
  const editModal = useModal<ContentDisplay>()
  const deleteModal = useModal<ContentDisplay>()

  const [content, setContent] = useState<ContentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await labDefinitionService.getAllLabDefinitions();
        setContent(response.map(mapLabDefinitionToContentDisplay));
      } catch (err: any) {
        setError(err.message || "Failed to fetch content.");
        console.error("Error fetching content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []); // Empty dependency array means this runs once on mount


  const { searchQuery, setSearchQuery, filteredData } = useSearch<ContentDisplay>({
    data: content,
    searchKeys: ["title", "course", "type"],
  })

  const handleAddLab = async (data: LabFormData) => { // ContentUploadWizard onComplete
    setError(null);
    try {
      const newLabDefinition: Omit<LabDefinition, 'id'> = {
        title: data.title,
        description: data.description || "",
        docker_image_name: data.dockerImageName,
        estimated_duration_minutes: data.estimatedDurationMinutes,
        instructions: data.instructions,
        activate: data.activate,
      };
      const createdLab = await labDefinitionService.createLabDefinition(newLabDefinition);
      setContent((prev) => [...prev, mapLabDefinitionToContentDisplay(createdLab)]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add lab.");
      console.error("Error adding lab:", err);
    }
  };

  const handleUpdateLab = async (data: LabFormData) => { // ContentFormModal onSubmit
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedLabDefinition: Partial<LabDefinition> = {
          title: data.title,
          description: data.description,
          docker_image_name: data.dockerImageName,
          estimated_duration_minutes: data.estimatedDurationMinutes,
          instructions: data.instructions,
          activate: data.activate,
        };
        const updatedLab = await labDefinitionService.updateLabDefinition(editModal.selectedItem.id, updatedLabDefinition);
        setContent((prev) =>
          prev.map((item) =>
            item.id === editModal.selectedItem!.id ? mapLabDefinitionToContentDisplay(updatedLab as LabDefinition) : item
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update lab.");
        console.error("Error updating lab:", err);
      }
    }
  };

  const handleDeleteLab = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await labDefinitionService.deleteLabDefinition(deleteModal.selectedItem.id);
        setContent((prev) => prev.filter((item) => item.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete lab.");
        console.error("Error deleting lab:", err);
      }
    }
  };

  const getTypeIcon = (type: ContentDisplay["type"]) => {
    switch (type) {
      case "Vidéo":
        return <Video className="h-4 w-4" />
      case "Document":
        return <FileText className="h-4 w-4" />
      case "Image":
        return <Image className="h-4 w-4" />
      case "Quiz":
        return <FileQuestion className="h-4 w-4" />
      case "Fichier":
        return <File className="h-4 w-4" />
      case "Lab": // Add case for Lab type
        return <HardDrive className="h-4 w-4" />
    }
  }

  const columns: ColumnDef<ContentDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titre",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            {getTypeIcon(row.original.type)}
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "course",
        header: "Formation",
      },
      {
        accessorKey: "module",
        header: "Module",
        cell: ({ row }) => row.original.module || "-",
      },
      {
        accessorKey: "duration",
        header: "Durée",
        cell: ({ row }) =>
          row.original.duration ? (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {row.original.duration}
            </div>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "uploadDate",
        header: "Date d'upload",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.uploadDate}
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
          const item = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(item),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(item),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title="Gestion des Labs"
        description="Gérez tous les labs de la plateforme"
        action={{
          label: "Ajouter un lab",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher un lab..."
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
              icon={HardDrive} // Changed icon to HardDrive for Labs
              title="Aucun lab"
              description="Commencez par ajouter un lab à la plateforme"
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      {/* LabFormModal for Add and Edit */}
      <LabFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un lab"
        description="Créez une nouvelle définition de lab"
        onSubmit={handleAddLab}
        submitLabel="Créer le lab"
      />

      {editModal.selectedItem && (
        <LabFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier le lab"
          description="Modifiez les informations du lab"
          defaultValues={mapContentDisplayToLabFormData(editModal.selectedItem)} // Mappage pour LabFormData
          onSubmit={handleUpdateLab}
          submitLabel="Enregistrer les modifications"
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteLab}
        title="Supprimer le lab"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.title} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}