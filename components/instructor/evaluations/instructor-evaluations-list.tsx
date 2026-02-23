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
import { Eye, Edit, Trash2, FileText, Calendar } from "lucide-react"
import { Evaluation, EvaluationType } from "@/models/evaluation.model"
import { evaluationService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import { CreateEvaluationModal } from "./create-evaluation-modal"
import { ViewEvaluationModal } from "@/components/admin/evaluations/modals/view-evaluation-modal"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"

type EvaluationDisplay = {
  id: number
  title: string
  description?: string
  status: string
  type: EvaluationType
  courseTitle?: string
  createdAt: string
}

const mapEvaluationToEvaluationDisplay = (evaluation: Evaluation): EvaluationDisplay => {
  return {
    id: evaluation.id || 0,
    title: evaluation.title || "N/A",
    description: evaluation.description || "N/A",
    status: evaluation.status || "N/A",
    type: evaluation.type || EvaluationType.QUIZ,
    courseTitle: evaluation.course?.title || "N/A",
    createdAt: evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
  }
}

export function InstructorEvaluationsList() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const dialog = useActionResultDialog()
  const addModal = useModal<EvaluationDisplay>()
  const editModal = useModal<EvaluationDisplay>()
  const deleteModal = useModal<EvaluationDisplay>()
  const viewModal = useModal<EvaluationDisplay>()

  const [evaluations, setEvaluations] = useState<EvaluationDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const fetchEvaluations = async () => {
    setLoading(true)
    setError(null)
    try {
      // Uniquement les évaluations de niveau cours (examen), pas les quiz associés à une leçon
      const response = await evaluationService.getCourseLevelEvaluations()
      if (Array.isArray(response) && response.length > 0) {
        setEvaluations(response.map(mapEvaluationToEvaluationDisplay))
      } else {
        setEvaluations([])
      }
    } catch (err: any) {
      console.error("Error fetching evaluations:", err)
      setError(err.message || t('evaluations.toasts.error_load') || "Impossible de charger les évaluations.")
      setEvaluations([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvaluation = async (data: any) => {
    setError(null)
    const isEdit = !!editModal.selectedItem
    try {
      const payload = {
        title: data.title,
        description: data.description,
        courseId: data.courseId,
        type: data.type,
        tpInstructions: data.tpInstructions,
        tpFileUrl: data.tpFileUrl,
        questions: data.questions,
      }
      if (isEdit) {
        await evaluationService.updateEvaluation(editModal.selectedItem!.id, payload)
        dialog.showSuccess(t('evaluations.toasts.success_update_message') || "Évaluation mise à jour avec succès.")
        editModal.close()
      } else {
        await evaluationService.createEvaluation(payload)
        dialog.showSuccess(t('evaluations.toasts.success_create_message') || "Évaluation créée avec succès.")
        addModal.close()
      }
      fetchEvaluations()
    } catch (err: any) {
      dialog.showError(err.message || (isEdit ? "Impossible de modifier l'évaluation." : "Impossible de créer l'évaluation."))
    }
  }

  const handleDeleteEvaluation = async (id: number) => {
    setError(null)
    try {
      await evaluationService.deleteEvaluation(id)
      dialog.showSuccess(t('evaluations.toasts.success_delete_message') || "Évaluation supprimée avec succès.")
      setEvaluations((prev) => prev.filter((evalItem) => evalItem.id !== id))
      deleteModal.close()
    } catch (err: any) {
      dialog.showError(err.message || "Impossible de supprimer l'évaluation.")
    }
  }

  const { searchQuery, setSearchQuery, filteredData } = useSearch<EvaluationDisplay>({
    data: evaluations,
    searchKeys: ["title", "description", "courseTitle"],
  })

  const evaluationColumns: ColumnDef<EvaluationDisplay>[] = useMemo(
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
            status={row.original.type === EvaluationType.QUIZ ? "QUIZ" : "TP"}
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
          const evaluation = row.original
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
                  onClick: () => deleteModal.open(evaluation),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal, t]
  )

  return (
    <>
      <PageHeader
        title={t('evaluations.title') || "Évaluations"}
        action={{
          label: t('evaluations.list.add_button') || "Ajouter une évaluation",
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
              description={t('evaluations.list.empty_description') || "Examen de fin de cours pour la certification"}
            />
          ) : (
            <DataTable columns={evaluationColumns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <CreateEvaluationModal
        open={addModal.isOpen || editModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            addModal.close()
            editModal.close()
          }
        }}
        onSubmit={handleCreateEvaluation}
        editEvaluationId={editModal.selectedItem?.id ?? null}
      />

      {viewModal.selectedItem && (
        <ViewEvaluationModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          evaluation={viewModal.selectedItem as any}
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
