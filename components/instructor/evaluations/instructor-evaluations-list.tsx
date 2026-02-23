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
import { Eye, Edit, Trash2, FileText, Calendar, CheckCircle, Clock, CheckCircle2 } from "lucide-react"
import { Evaluation, EvaluationType, EvaluationAttempt } from "@/models/evaluation.model"
import { evaluationService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import { CreateEvaluationModal } from "./create-evaluation-modal"
import { CorrectTpModal } from "./correct-tp-modal"
import { ViewEvaluationModal } from "@/components/admin/evaluations/modals/view-evaluation-modal"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type EvaluationDisplay = {
  id: number
  title: string
  description?: string
  status: string
  type: EvaluationType
  courseTitle?: string
  createdAt: string
}

type PendingTpDisplay = {
  id: number
  evaluationId: number
  evaluationTitle: string
  learnerName: string
  submittedFileUrl?: string
  submittedText?: string
  createdAt: string
}

type CorrectedTpDisplay = {
  id: number
  evaluationId: number
  evaluationTitle: string
  learnerName: string
  submittedFileUrl?: string
  score: number
  feedback?: string
  correctedAt: string
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
  const { user } = useAuth()
  const addModal = useModal<EvaluationDisplay>()
  const editModal = useModal<EvaluationDisplay>()
  const deleteModal = useModal<EvaluationDisplay>()
  const viewModal = useModal<EvaluationDisplay>()
  const correctTpModal = useModal<EvaluationAttempt>()

  const [evaluations, setEvaluations] = useState<EvaluationDisplay[]>([])
  const [pendingTps, setPendingTps] = useState<PendingTpDisplay[]>([])
  const [correctedTps, setCorrectedTps] = useState<CorrectedTpDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("evaluations")

  useEffect(() => {
    fetchEvaluations()
    if (user?.id) {
      fetchPendingTps()
      fetchCorrectedTps()
    }
  }, [user?.id])

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

  const fetchPendingTps = async () => {
    if (!user?.id) return
    try {
      const response = await evaluationService.getPendingEvaluationsForInstructor(Number(user.id))
      if (Array.isArray(response) && response.length > 0) {
        setPendingTps(response.map((attempt: EvaluationAttempt) => ({
          id: attempt.id,
          evaluationId: attempt.evaluationId,
          evaluationTitle: attempt.evaluationTitle ?? "Évaluation",
          learnerName: attempt.learnerName ?? attempt.learnerEmail ?? "Apprenant",
          submittedFileUrl: attempt.submittedFileUrl || undefined,
          submittedText: attempt.submittedText || undefined,
          createdAt: attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString("fr-FR") : "N/A",
        })))
      } else {
        setPendingTps([])
      }
    } catch (err: any) {
      console.error("Error fetching pending TPs:", err)
      setPendingTps([])
    }
  }

  const fetchCorrectedTps = async () => {
    if (!user?.id) return
    try {
      const response = await evaluationService.getCorrectedEvaluationsForInstructor(Number(user.id))
      if (Array.isArray(response) && response.length > 0) {
        setCorrectedTps(response.map((attempt: EvaluationAttempt) => ({
          id: attempt.id,
          evaluationId: attempt.evaluationId,
          evaluationTitle: attempt.evaluationTitle ?? "Évaluation",
          learnerName: attempt.learnerName ?? attempt.learnerEmail ?? "Apprenant",
          submittedFileUrl: attempt.submittedFileUrl || undefined,
          score: attempt.score || 0,
          feedback: attempt.instructorFeedback || undefined,
          correctedAt: attempt.correctedAt ? new Date(attempt.correctedAt).toLocaleDateString("fr-FR") : "N/A",
          createdAt: attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString("fr-FR") : "N/A",
        })))
      } else {
        setCorrectedTps([])
      }
    } catch (err: any) {
      console.error("Error fetching corrected TPs:", err)
      setCorrectedTps([])
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

  const handleCorrectTp = async (data: { score: number; feedback?: string }) => {
    if (!correctTpModal.selectedItem) return
    setError(null)
    try {
      await evaluationService.correctEvaluation({
        attemptId: correctTpModal.selectedItem.id,
        score: data.score,
        feedback: data.feedback,
      })
      dialog.showSuccess(t('evaluations.toasts.success_correct_message') || "TP corrigé avec succès.")
      correctTpModal.close()
      fetchPendingTps()
      fetchCorrectedTps()
    } catch (err: any) {
      dialog.showError(err.message || "Impossible de corriger le TP.")
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

  const pendingTpColumns: ColumnDef<PendingTpDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "evaluationTitle",
        header: t('evaluations.pending.header_evaluation') || "Évaluation",
        cell: ({ row }) => row.original.evaluationTitle,
      },
      {
        accessorKey: "learnerName",
        header: t('evaluations.pending.header_learner') || "Apprenant",
        cell: ({ row }) => row.original.learnerName,
      },
      {
        accessorKey: "createdAt",
        header: t('evaluations.pending.header_submitted') || "Soumis le",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.createdAt}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('table.actions') || "Actions",
        cell: ({ row }) => {
          const tp = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('evaluations.pending.action_correct') || "Corriger",
                  icon: <CheckCircle className="h-4 w-4" />,
                  onClick: () => {
                    // TODO: Fetch full attempt data
                    correctTpModal.open({
                      id: tp.id,
                      evaluationId: tp.evaluationId,
                      userId: 0,
                      status: "PENDING" as any,
                      submittedFileUrl: tp.submittedFileUrl || undefined,
                    } as EvaluationAttempt)
                  },
                },
              ]}
            />
          )
        },
      },
    ],
    [correctTpModal, t]
  )

  const correctedTpColumns: ColumnDef<CorrectedTpDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "evaluationTitle",
        header: t('evaluations.corrected.header_evaluation') || "Évaluation",
        cell: ({ row }) => row.original.evaluationTitle,
      },
      {
        accessorKey: "learnerName",
        header: t('evaluations.corrected.header_learner') || "Apprenant",
        cell: ({ row }) => row.original.learnerName,
      },
      {
        accessorKey: "score",
        header: t('evaluations.corrected.header_score') || "Score",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-orange-600">{row.original.score}/100</span>
          </div>
        ),
      },
      {
        accessorKey: "correctedAt",
        header: t('evaluations.corrected.header_corrected') || "Corrigé le",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            {row.original.correctedAt}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('table.actions') || "Actions",
        cell: ({ row }) => {
          const tp = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('evaluations.corrected.action_view') || "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => {
                    // TODO: Open view modal with correction details
                    viewModal.open({
                      id: tp.evaluationId,
                      title: tp.evaluationTitle,
                      description: tp.feedback || "",
                    } as EvaluationDisplay)
                  },
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, t]
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
              <TabsTrigger 
                value="evaluations"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                {t('evaluations.tabs.evaluations') || "Mes évaluations"}
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                {t('evaluations.tabs.pending_tps') || `TPs en attente (${pendingTps.length})`}
              </TabsTrigger>
              <TabsTrigger 
                value="corrected"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                {t('evaluations.tabs.corrected_tps') || `TPs corrigés (${correctedTps.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="evaluations">
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
                  description={t('evaluations.list.empty_description') || "Commencez par ajouter une évaluation"}
                />
              ) : (
                <DataTable columns={evaluationColumns} data={filteredData} searchValue={searchQuery} />
              )}
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              {pendingTps.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title={t('evaluations.pending.empty_title') || "Aucun TP en attente"}
                  description={t('evaluations.pending.empty_description') || "Tous les TPs ont été corrigés"}
                />
              ) : (
                <DataTable columns={pendingTpColumns} data={pendingTps} />
              )}
            </TabsContent>
            <TabsContent value="corrected" className="space-y-4">
              {correctedTps.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title={t('evaluations.corrected.empty_title') || "Aucun TP corrigé"}
                  description={t('evaluations.corrected.empty_description') || "Les TPs corrigés apparaîtront ici"}
                />
              ) : (
                <DataTable columns={correctedTpColumns} data={correctedTps} />
              )}
            </TabsContent>
          </Tabs>
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

      {correctTpModal.selectedItem && (
        <CorrectTpModal
          open={correctTpModal.isOpen}
          onOpenChange={(open) => !open && correctTpModal.close()}
          attempt={correctTpModal.selectedItem}
          onSubmit={handleCorrectTp}
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
