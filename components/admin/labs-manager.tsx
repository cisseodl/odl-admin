"use client"

import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"

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
import { Edit, Trash2, FileText, Video, Image, FileQuestion, File, Calendar, Clock, HardDrive, ExternalLink, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

import { LabDefinition } from "@/models"; // Import LabDefinition from models/index.ts
import { labDefinitionService, labSessionService, type LabSubmissionForInstructor } from "@/services"; // Import labDefinitionService from services/index.ts

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
  uploadedFiles?: string;
  resourceLinks?: string;
  estimatedDurationMinutes?: number;
  maxDurationMinutes?: number;
  instructions?: string;
  activate?: boolean;
  lessonId?: number | null; // ID de la leçon associée
}

  // Helper function to map LabDefinition to ContentDisplay
const mapLabDefinitionToContentDisplay = (lab: any): ContentDisplay => {
  // Récupérer les informations de la leçon si disponibles
  const lesson = (lab as any).lesson || null;
  const module = lesson?.module || null;
  // Le cours peut être dans module.course ou directement dans lesson.course
  const course = module?.course || lesson?.course || null;
  
  // Calculer la durée : utiliser estimated_duration_minutes, sinon max_duration_minutes, sinon la durée de la leçon
  let durationDisplay = "N/A";
  if (lab.estimated_duration_minutes) {
    durationDisplay = `${lab.estimated_duration_minutes} min`;
  } else if (lab.max_duration_minutes) {
    durationDisplay = `${lab.max_duration_minutes} min`;
  } else if (lesson?.duration) {
    durationDisplay = `${lesson.duration} min`;
  }
  
  return {
    id: lab.id || 0,
    title: lab.title,
    type: "Lab", // Hardcode type for LabDefinition
    course: course?.title || "N/A", // Récupérer depuis la leçon/module/cours
    module: module?.title || "N/A", // Récupérer depuis la leçon/module (gardé pour compatibilité mais ne sera pas affiché)
    duration: durationDisplay,
    size: "N/A", // Placeholder, as not in LabDefinition model
    uploadDate: lab.createdAt ? new Date(lab.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "",
    status: lab.activate ? "Publié" : "Brouillon", // Assuming activate maps to status
    description: lab.description || "",
    uploadedFiles: lab.uploaded_files || "",
    resourceLinks: lab.resource_links || "",
    estimatedDurationMinutes: lab.estimated_duration_minutes,
    maxDurationMinutes: lab.max_duration_minutes,
    instructions: lab.instructions || "",
    activate: lab.activate,
    lessonId: lab.lesson_id || null,
  };
};

// Helper function to map ContentDisplay to LabFormData for editing
const mapContentDisplayToLabFormData = (content: ContentDisplay): LabFormData => {
  return {
    title: content.title,
    description: content.description || "",
    uploadedFiles: content.uploadedFiles || "",
    resourceLinks: content.resourceLinks || "",
    estimatedDurationMinutes: content.estimatedDurationMinutes || 60,
    maxDurationMinutes: content.maxDurationMinutes || 90,
    instructions: content.instructions || "",
    activate: content.activate ?? true,
    lessonId: content.lessonId || undefined,
    labType: content.uploadedFiles && content.uploadedFiles !== "" && content.uploadedFiles !== "[]" ? "file" :
             content.resourceLinks && content.resourceLinks !== "" && content.resourceLinks !== "[]" ? "link" : "instructions",
  };
};


export function LabsManager() {
  const { user } = useAuth()
  const addModal = useModal<ContentDisplay>()
  const editModal = useModal<ContentDisplay>()
  const deleteModal = useModal<ContentDisplay>()

  const [content, setContent] = useState<ContentDisplay[]>([]);
  const [submissions, setSubmissions] = useState<LabSubmissionForInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("labs");
  const dialog = useActionResultDialog();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await labDefinitionService.getAllLabDefinitions();
        console.log("[LabsManager] Labs récupérés:", response);
        console.log("[LabsManager] Nombre de labs:", response.length);
        if (response.length > 0) {
          console.log("[LabsManager] Premier lab brut:", response[0]);
        }
        const mapped = response.map(mapLabDefinitionToContentDisplay);
        console.log("[LabsManager] Labs mappés:", mapped);
        if (mapped.length > 0) {
          console.log("[LabsManager] Premier lab mappé:", mapped[0]);
        }
        setContent(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to fetch content.");
        console.error("Error fetching content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (activeTab !== "realisations" || !user?.id) return
    const fetchSubmissions = async () => {
      setLoadingSubmissions(true)
      try {
        const data = await labSessionService.getInstructorSubmissions(Number(user.id))
        setSubmissions(data ?? [])
      } catch (err) {
        setSubmissions([])
      } finally {
        setLoadingSubmissions(false)
      }
    }
    fetchSubmissions()
  }, [activeTab, user?.id])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<ContentDisplay>({
    data: Array.isArray(content) ? content : [],
    searchKeys: ["title", "course", "type"],
  })

  const handleAddLab = async (data: LabFormData) => {
    console.log("handleAddLab called with data:", data)
    setError(null);
    try {
      // Valider que lessonId est fourni
      if (!data.lessonId || data.lessonId <= 0) {
        dialog.showError("La leçon est requise pour créer un lab");
        return;
      }
      
      // Valider que les durées sont fournies
      if (!data.estimatedDurationMinutes || data.estimatedDurationMinutes <= 0) {
        dialog.showError("La durée estimée est requise et doit être supérieure à 0");
        return;
      }
      if (!data.maxDurationMinutes || data.maxDurationMinutes <= 0) {
        dialog.showError("La durée maximale est requise et doit être supérieure à 0");
        return;
      }
      
      // Préparer les données selon le type de lab choisi
      const newLabDefinition: Omit<LabDefinition, 'id'> = {
        title: data.title,
        description: data.description || "",
        uploaded_files: data.labType === "file" ? (data.uploadedFiles || null) : null,
        resource_links: data.labType === "link" ? (data.resourceLinks || null) : null,
        estimated_duration_minutes: Number(data.estimatedDurationMinutes),
        max_duration_minutes: Number(data.maxDurationMinutes),
        instructions: data.labType === "instructions" ? (data.instructions || "") : (data.instructions || ""),
        lesson_id: Number(data.lessonId),
        activate: data.activate ?? true,
      };
      console.log("Creating lab with:", newLabDefinition)
      const createdLab = await labDefinitionService.createLabDefinition(newLabDefinition);
      console.log("Lab created successfully:", createdLab)
      setContent((prev) => [...prev, mapLabDefinitionToContentDisplay(createdLab)]);
      addModal.close();
      dialog.showSuccess("Le lab a été créé avec succès.");
    } catch (err: any) {
      console.error("Error in handleAddLab:", err)
      dialog.showError(err.message || "Erreur lors de la création du lab.");
      console.error("Error adding lab:", err);
    }
  };

  const handleUpdateLab = async (data: LabFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        // Valider que lessonId est fourni
        if (!data.lessonId || data.lessonId <= 0) {
          dialog.showError("La leçon est requise pour mettre à jour un lab");
          return;
        }
        
        const updatedLabDefinition: Partial<LabDefinition> = {
          title: data.title,
          description: data.description,
          uploaded_files: data.labType === "file" ? (data.uploadedFiles || null) : null,
          resource_links: data.labType === "link" ? (data.resourceLinks || null) : null,
          estimated_duration_minutes: data.estimatedDurationMinutes,
          max_duration_minutes: data.maxDurationMinutes || data.estimatedDurationMinutes,
          instructions: data.labType === "instructions" ? (data.instructions || "") : (data.instructions || ""),
          lesson_id: data.lessonId,
          activate: data.activate ?? true,
        };
        const updatedLab = await labDefinitionService.updateLabDefinition(editModal.selectedItem.id, updatedLabDefinition);
        setContent((prev) =>
          prev.map((item) =>
            item.id === editModal.selectedItem!.id ? mapLabDefinitionToContentDisplay(updatedLab as LabDefinition) : item
          )
        );
        editModal.close();
        dialog.showSuccess("Le lab a été mis à jour avec succès.");
      } catch (err: any) {
        dialog.showError(err.message || "Erreur lors de la mise à jour du lab.");
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
        dialog.showSuccess("Le lab a été supprimé avec succès.");
      } catch (err: any) {
        dialog.showError(err.message || "Erreur lors de la suppression du lab.");
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
        cell: ({ row }) => row.original.course || "N/A",
      },
      {
        accessorKey: "duration",
        header: "Durée",
        cell: ({ row }) => {
          const duration = row.original.duration;
          if (duration && duration !== "N/A" && duration !== "-") {
            return (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {duration}
              </div>
            );
          }
          // Si pas de durée, essayer de récupérer depuis estimatedDurationMinutes ou maxDurationMinutes
          const estimated = row.original.estimatedDurationMinutes;
          const max = row.original.maxDurationMinutes;
          if (estimated) {
            return (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {estimated} min
              </div>
            );
          }
          if (max) {
            return (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {max} min
              </div>
            );
          }
          return "-";
        },
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

  const submissionColumns: ColumnDef<LabSubmissionForInstructor>[] = useMemo(
    () => [
      { accessorKey: "labTitle", header: "Lab", cell: ({ row }) => <span className="font-medium">{row.original.labTitle || "—"}</span> },
      { accessorKey: "courseTitle", header: "Cours", cell: ({ row }) => row.original.courseTitle || "—" },
      { accessorKey: "lessonTitle", header: "Leçon", cell: ({ row }) => row.original.lessonTitle || "—" },
      {
        accessorKey: "learnerName",
        header: "Apprenant",
        cell: ({ row }) => (
          <span className="flex items-center gap-1">
            <User className="h-4 w-4 text-muted-foreground" />
            {row.original.learnerName || row.original.learnerEmail || "—"}
          </span>
        ),
      },
      {
        accessorKey: "reportUrl",
        header: "Rapport",
        cell: ({ row }) =>
          row.original.reportUrl ? (
            <a
              href={row.original.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" /> Voir le rapport
            </a>
          ) : (
            "—"
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Soumis le",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
            : "—",
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        title="Gestion des Labs"
        description="Gérez les labs et consultez les réalisations (rapports) soumises par les apprenants"
        action={
          activeTab === "labs"
            ? { label: "Ajouter un lab", onClick: () => addModal.open() }
            : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="realisations">Réalisations des apprenants</TabsTrigger>
        </TabsList>

        <TabsContent value="labs" className="mt-4">
          <Card>
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
                  icon={HardDrive}
                  title="Aucun lab"
                  description="Commencez par ajouter un lab à la plateforme"
                />
              ) : (
                <DataTable columns={columns} data={Array.isArray(filteredData) ? filteredData : []} searchValue={searchQuery} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realisations" className="mt-4">
          <Card>
            <CardContent>
              {loadingSubmissions ? (
                <PageLoader />
              ) : submissions.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Aucune réalisation"
                  description="Les rapports soumis par les apprenants (Ma réalisation) apparaîtront ici."
                />
              ) : (
                <DataTable columns={submissionColumns} data={submissions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* Dialogue de résultat */}
      <ActionResultDialog
        isOpen={dialog.isOpen}
        onOpenChange={dialog.setIsOpen}
        isSuccess={dialog.isSuccess}
        message={dialog.message}
        title={dialog.title}
      />
    </>
  )
}