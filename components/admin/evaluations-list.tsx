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
import { Eye, Edit, Trash2, FileText, Upload, Calendar } from "lucide-react"

import { Evaluation } from "@/models";
import { evaluationService } from "@/services";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "./empty-state";
// Assume EvaluationFormModal and ViewEvaluationModal exist or need to be created
import { EvaluationFormModal } from "@/components/shared/evaluation-form-modal"; // Placeholder
import { ViewEvaluationModal } from "./evaluations/modals/view-evaluation-modal"; // Corrected path
type EvaluationDisplay = {
  id: number
  title: string
  description?: string
  status: string
  imagePath?: string
  createdAt: string
  // Add other fields needed for display
}

// Helper function to map Evaluation to EvaluationDisplay
const mapEvaluationToEvaluationDisplay = (evaluation: Evaluation): EvaluationDisplay => {
  return {
    id: evaluation.id || 0,
    title: evaluation.title || "N/A",
    description: evaluation.description || "N/A",
    status: evaluation.status || "N/A",
    imagePath: evaluation.imagePath || undefined,
    createdAt: evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
  };
};

export function EvaluationsList() {
  const addModal = useModal<EvaluationDisplay>()
  const editModal = useModal<EvaluationDisplay>()
  const deleteModal = useModal<EvaluationDisplay>()
  const viewModal = useModal<EvaluationDisplay>()

  const [evaluations, setEvaluations] = useState<EvaluationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await evaluationService.getAllEvaluations();
        setEvaluations(response.map(mapEvaluationToEvaluationDisplay));
      } catch (err: any) {
        setError(err.message || "Failed to fetch evaluations.");
        console.error("Error fetching evaluations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  const { searchQuery, setSearchQuery, filteredData } = useSearch<EvaluationDisplay>({
    data: evaluations,
    searchKeys: ["title", "description"],
  });

  const handleAddEvaluation = async (data: any) => {
    setError(null);
    try {
      // Assuming 'data' contains title, description, and status
      const newEvaluationData = {
        title: data.title,
        description: data.description,
        status: data.status || "Draft", // Default status
        // imagePath: data.imagePath, // If uploading file directly
      };
      const createdEvaluation = await evaluationService.createEvaluation(newEvaluationData);
      setEvaluations((prev) => [...prev, mapEvaluationToEvaluationDisplay(createdEvaluation)]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add evaluation.");
      console.error("Error adding evaluation:", err);
    }
  };

  const handleUpdateEvaluation = (data: any) => {
    console.log("Update evaluation:", data);
    editModal.close();
  };

  const handleDeleteEvaluation = (id: number) => {
    console.log("Delete evaluation with ID:", id);
    deleteModal.close();
  };


  const columns: ColumnDef<EvaluationDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titre",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Date de création",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.createdAt}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const evaluation = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(evaluation),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(evaluation),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(evaluation.id),
                  variant: "destructive",
                },
              ]}
            />
          );
        },
      },
    ],
    [viewModal, editModal, deleteModal]
  );

  return (
    <>
      <PageHeader
        title="Évaluations"
        action={{
          label: "Ajouter une évaluation",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher une évaluation..."
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
              icon={FileText}
              title="Aucune évaluation"
              description="Commencez par ajouter une évaluation à la plateforme"
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      {/* Modals for Add, Edit, View, Delete */}
      <EvaluationFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter une évaluation"
        description="Créez une nouvelle évaluation pour les cours"
        onSubmit={handleAddEvaluation}
        submitLabel="Créer l'évaluation"
      />

      {editModal.selectedItem && (
        <EvaluationFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier l'évaluation"
          description="Modifiez les informations de l'évaluation"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateEvaluation}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewEvaluationModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          evaluation={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={() => handleDeleteEvaluation(deleteModal.selectedItem?.id || 0)}
        title="Supprimer l'évaluation"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.title} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
