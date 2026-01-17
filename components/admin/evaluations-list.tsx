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

import { Evaluation, EvaluationType } from "@/models";
import { evaluationService } from "@/services";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "./empty-state";
import { EvaluationFormModal } from "@/components/shared/evaluation-form-modal";
import { ViewEvaluationModal } from "./evaluations/modals/view-evaluation-modal";
import { useLanguage } from "@/contexts/language-context";

type EvaluationDisplay = {
  id: number
  title: string
  description?: string
  status: string
  imagePath?: string
  type?: EvaluationType
  courseTitle?: string
  createdAt: string
}

// Helper function to map Evaluation to EvaluationDisplay
const mapEvaluationToEvaluationDisplay = (evaluation: Evaluation): EvaluationDisplay => {
  return {
    id: evaluation.id || 0,
    title: evaluation.title || "N/A",
    description: evaluation.description || "N/A",
    status: evaluation.status || "N/A",
    imagePath: evaluation.imagePath || undefined,
    type: evaluation.type,
    courseTitle: evaluation.course?.title || "N/A",
    createdAt: evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
  };
};

// Helper function to map EvaluationDisplay to EvaluationFormData
const mapEvaluationDisplayToEvaluationFormData = (evaluation: EvaluationDisplay): EvaluationFormData => {
  return {
    title: evaluation.title,
    description: evaluation.description || "",
    status: evaluation.status as "Draft" | "Active" | "Archived", // Assuming status maps directly
  };
};

export function EvaluationsList() {
  const { t } = useLanguage()
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

  const handleUpdateEvaluation = async (data: any) => { // 'data' type should be more specific, e.g., EvaluationFormData
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedEvaluationData: Partial<Evaluation> = {
          title: data.title,
          description: data.description,
          status: data.status,
          imagePath: data.imagePath, // Assuming imagePath comes from form data
          // other fields from data
        };
        const updatedEvaluation = await evaluationService.updateEvaluation(editModal.selectedItem.id, updatedEvaluationData);
        setEvaluations((prev) =>
          prev.map((evalItem) =>
            evalItem.id === editModal.selectedItem!.id ? mapEvaluationToEvaluationDisplay(updatedEvaluation) : evalItem
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update evaluation.");
        console.error("Error updating evaluation:", err);
      }
    }
  };

  const handleDeleteEvaluation = async (id: number) => {
    setError(null);
    try {
      await evaluationService.deleteEvaluation(id);
      setEvaluations((prev) => prev.filter((evalItem) => evalItem.id !== id));
      deleteModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to delete evaluation.");
      console.error("Error deleting evaluation:", err);
    }
  };


  const columns: ColumnDef<EvaluationDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t('evaluations.list.header_title') || "Titre",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: t('evaluations.list.header_type') || "Type",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.type === EvaluationType.QUIZ ? "QUIZ" : row.original.type === EvaluationType.TP ? "TP" : "N/A"}
          />
        ),
      },
      {
        accessorKey: "courseTitle",
        header: t('evaluations.list.header_course') || "Cours",
        cell: ({ row }) => row.original.courseTitle || "N/A",
      },
      {
        accessorKey: "status",
        header: t('evaluations.list.header_status') || "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: t('evaluations.list.header_created') || "Date de création",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.createdAt}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('table.actions') || "Actions",
        cell: ({ row }) => {
          const evaluation = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: t('evaluations.list.action_view') || "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(evaluation),
                },
                {
                  label: t('evaluations.list.action_edit') || "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(evaluation),
                },
                {
                  label: t('evaluations.list.action_delete') || "Supprimer",
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
    [viewModal, editModal, deleteModal, t]
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
              placeholder={t('evaluations.list.search_placeholder') || "Rechercher une évaluation..."}
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
              title={t('evaluations.list.empty_title') || "Aucune évaluation"}
              description={t('evaluations.list.empty_description') || "Commencez par ajouter une évaluation à la plateforme"}
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
        title={t('evaluations.create.title') || "Ajouter une évaluation"}
        description={t('evaluations.create.description') || "Créez une nouvelle évaluation pour les cours"}
        onSubmit={handleAddEvaluation}
        submitLabel={t('evaluations.create.submit') || "Créer l'évaluation"}
      />

      {editModal.selectedItem && (
        <EvaluationFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('evaluations.edit.title') || "Modifier l'évaluation"}
          description={t('evaluations.edit.description') || "Modifiez les informations de l'évaluation"}
          defaultValues={mapEvaluationDisplayToEvaluationFormData(editModal.selectedItem)}
          onSubmit={handleUpdateEvaluation}
          submitLabel={t('evaluations.edit.submit') || "Enregistrer les modifications"}
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
        title={t('evaluations.delete.title') || "Supprimer l'évaluation"}
        description={t('evaluations.delete.description') || `Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.title} ? Cette action est irréversible.`}
        confirmText={t('evaluations.delete.confirm') || "Supprimer"}
        variant="destructive"
      />
    </>
  )
}
