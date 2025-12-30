"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ContentUploadWizard } from "@/components/admin/content/content-upload-wizard"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "./empty-state"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, FileText, Video, Image, FileQuestion, File, Calendar, Clock, HardDrive } from "lucide-react"
import type { ContentFormData } from "@/lib/validations/content"
import { ContentFormModal } from "@/components/shared/content-form-modal" // Import ContentFormModal

import { LabDefinition } from "@/models"; // Import LabDefinition from models/index.ts
import { labDefinitionService } from "@/services"; // Import labDefinitionService from services/index.ts
import { useEffect } from "react";
import { PageLoader } from "@/components/ui/page-loader";


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
}

// Helper function to map LabDefinition to ContentDisplay
const mapLabDefinitionToContentDisplay = (lab: LabDefinition): ContentDisplay => {
  return {
    id: lab.id || 0,
    title: lab.title,
    type: "Lab", // Hardcode type for LabDefinition
    course: "Lab Course", // Placeholder
    module: "Lab Module", // Placeholder
    duration: lab.estimated_duration_minutes ? `${lab.estimated_duration_minutes} min` : "N/A",
    size: "N/A", // Placeholder
    uploadDate: lab.createdAt ? new Date(lab.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "",
    status: lab.activate ? "Publié" : "Brouillon", // Assuming activate maps to status
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

  const handleAddContent = async (data: ContentFormData & { file?: File }) => {
    setError(null);
    try {
      // Assuming ContentUploadWizard data can be mapped to LabDefinition
      // This mapping needs to be more robust based on actual wizard output
      const newLabDefinition: Omit<LabDefinition, 'id'> = {
        title: data.title,
        description: data.description || "",
        docker_image_name: "placeholder", // Placeholder
        estimated_duration_minutes: 60, // Placeholder
        instructions: "placeholder", // Placeholder
        activate: true, // Assuming active
      };
      const createdLab = await labDefinitionService.createLabDefinition(newLabDefinition);
      setContent((prev) => [...prev, mapLabDefinitionToContentDisplay(createdLab)]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add content.");
      console.error("Error adding content:", err);
    }
  };

  const handleUpdateContent = (data: ContentFormData) => {
    // No explicit API endpoint for LabDefinition update in test.md
    // For now, keeping as mock/placeholder
    if (editModal.selectedItem) {
      setContent((prev) =>
        prev.map((item) =>
          item.id === editModal.selectedItem!.id ? { ...item, ...data } : item
        )
      );
      editModal.close();
    }
  };

  const handleDeleteContent = () => {
    // No explicit API endpoint for LabDefinition delete in test.md
    // For now, keeping as mock/placeholder
    if (deleteModal.selectedItem) {
      setContent((prev) => prev.filter((item) => item.id !== deleteModal.selectedItem!.id));
      deleteModal.close();
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
        accessorKey: "size",
        header: "Taille",
        cell: ({ row }) =>
          row.original.size ? (
            <div className="flex items-center gap-1">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              {row.original.size}
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

      {/* ContentUploadWizard -> LabUploadWizard (needs to be created or renamed) */}
      <ContentUploadWizard
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        onComplete={handleAddContent}
      />

      {editModal.selectedItem && (
        <ContentFormModal // ContentFormModal -> LabFormModal (needs to be created or renamed)
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier le lab"
          description="Modifiez les informations du lab"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateContent}
          submitLabel="Enregistrer les modifications"
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteContent}
        title="Supprimer le lab"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.title} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
