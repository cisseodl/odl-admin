"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2, ClipboardList, Clock, Calendar, CheckCircle, CheckCircle2, Eye, FileText } from "lucide-react"
import { Evaluation, EvaluationType, EvaluationAttempt } from "@/models/evaluation.model"
import { evaluationService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import { TDFormModal } from "@/components/shared/td-form-modal"
import { CorrectTpModal } from "@/components/instructor/evaluations/correct-tp-modal"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"

type TDDisplay = {
  id: number
  title: string
  description?: string
  course: string
  lesson?: string
  uploadDate: string
  status: "Publié" | "Brouillon"
  tpInstructions?: string
  tpFileUrl?: string
  lessonId?: number
  courseId?: number
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

const mapEvaluationToTDDisplay = (evaluation: Evaluation): TDDisplay => {
  return {
    id: evaluation.id || 0,
    title: evaluation.title || "Sans titre",
    description: evaluation.description || "",
    course: evaluation.course?.title || "N/A",
    lesson: evaluation.lesson?.title || undefined,
    uploadDate: evaluation.createdAt 
      ? new Date(evaluation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
      : "",
    status: evaluation.activate ? "Publié" : "Brouillon",
    tpInstructions: evaluation.tpInstructions || "",
    tpFileUrl: evaluation.tpFileUrl || "",
    lessonId: (evaluation as any).lesson?.id || (evaluation as any).lessonId,
    courseId: evaluation.courseId,
  }
}

export function TDsManager() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()
  const dialog = useActionResultDialog()
  const addModal = useModal<TDDisplay>()
  const editModal = useModal<TDDisplay>()
  const deleteModal = useModal<TDDisplay>()
  const correctTpModal = useModal<EvaluationAttempt>()

  const [tds, setTds] = useState<TDDisplay[]>([])
  const [pendingTps, setPendingTps] = useState<PendingTpDisplay[]>([])
  const [correctedTps, setCorrectedTps] = useState<CorrectedTpDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tds")

  useEffect(() => {
    fetchTDs()
  }, [])

  useEffect(() => {
    if (activeTab !== "realisations" || !user?.id) return
    setLoadingSubmissions(true)
    const load = async () => {
      try {
        const [pending, corrected] = await Promise.all([
          evaluationService.getPendingEvaluationsForInstructor(Number(user.id)),
          evaluationService.getCorrectedEvaluationsForInstructor(Number(user.id)),
        ])
        setPendingTps(
          Array.isArray(pending)
            ? pending.map((a: EvaluationAttempt) => ({
                id: a.id,
                evaluationId: a.evaluationId,
                evaluationTitle: a.evaluationTitle ?? "TD",
                learnerName: a.learnerName ?? a.learnerEmail ?? "Apprenant",
                submittedFileUrl: a.submittedFileUrl ?? undefined,
                submittedText: a.submittedText ?? undefined,
                createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "N/A",
              }))
            : []
        )
        setCorrectedTps(
          Array.isArray(corrected)
            ? corrected.map((a: EvaluationAttempt) => ({
                id: a.id,
                evaluationId: a.evaluationId,
                evaluationTitle: a.evaluationTitle ?? "TD",
                learnerName: a.learnerName ?? a.learnerEmail ?? "Apprenant",
                submittedFileUrl: a.submittedFileUrl ?? undefined,
                score: a.score ?? 0,
                feedback: a.instructorFeedback ?? undefined,
                correctedAt: a.correctedAt ? new Date(a.correctedAt).toLocaleDateString("fr-FR") : "N/A",
                createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "N/A",
              }))
            : []
        )
      } catch {
        setPendingTps([])
        setCorrectedTps([])
      } finally {
        setLoadingSubmissions(false)
      }
    }
    load()
  }, [activeTab, user?.id])

  const fetchTDs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await evaluationService.getAllEvaluations()
      // Filtrer seulement les évaluations de type TP
      const tpEvaluations = response.filter((e: Evaluation) => e.type === EvaluationType.TP)
      setTds(tpEvaluations.map(mapEvaluationToTDDisplay))
    } catch (err: any) {
      setError(err.message || "Failed to fetch TDs.")
      console.error("Error fetching TDs:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les TDs.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const { searchQuery, setSearchQuery, filteredData } = useSearch<TDDisplay>({
    data: tds,
    searchKeys: ["title", "description", "course", "lesson"],
  })

  const handleAddTD = async (data: any) => {
    setError(null)
    try {
      const newTDData = {
        title: data.title,
        description: data.description || "",
        courseId: data.courseId,
        lessonId: data.lessonId,
        type: EvaluationType.TP,
        tpInstructions: data.tpInstructions || "",
        tpFileUrl: data.tpFileUrl || "",
      }
      const createdTD = await evaluationService.createEvaluation(newTDData)
      setTds((prev) => [...prev, mapEvaluationToTDDisplay(createdTD)])
      addModal.close()
      dialog.showSuccess("Le TD a été créé avec succès.")
      fetchTDs()
    } catch (err: any) {
      console.error("Error adding TD:", err)
      dialog.showError(err.message || "Impossible de créer le TD.")
    }
  }

  const handleUpdateTD = async (data: any) => {
    setError(null)
    if (editModal.selectedItem) {
      try {
        const updatedTDData = {
          title: data.title,
          description: data.description || "",
          tpInstructions: data.tpInstructions || "",
          tpFileUrl: data.tpFileUrl || "",
          courseId: data.courseId,
          lessonId: data.lessonId,
        }
        const updatedTD = await evaluationService.updateEvaluation(editModal.selectedItem.id, updatedTDData)
        setTds((prev) =>
          prev.map((item) =>
            item.id === editModal.selectedItem!.id ? mapEvaluationToTDDisplay(updatedTD) : item
          )
        )
        editModal.close()
        dialog.showSuccess("Le TD a été mis à jour avec succès.")
        fetchTDs()
      } catch (err: any) {
        console.error("Error updating TD:", err)
        dialog.showError(err.message || "Impossible de mettre à jour le TD.")
      }
    }
  }

  const handleDeleteTD = async () => {
    setError(null)
    if (deleteModal.selectedItem) {
      try {
        await evaluationService.deleteEvaluation(deleteModal.selectedItem.id)
        setTds((prev) => prev.filter((item) => item.id !== deleteModal.selectedItem!.id))
        deleteModal.close()
        dialog.showSuccess("Le TD a été supprimé avec succès.")
      } catch (err: any) {
        console.error("Error deleting TD:", err)
        dialog.showError(err.message || "Impossible de supprimer le TD.")
      }
    }
  }

  const handleCorrectTp = async (data: { score: number; feedback?: string }) => {
    if (!correctTpModal.selectedItem) return
    try {
      await evaluationService.correctEvaluation({
        attemptId: correctTpModal.selectedItem.id,
        score: data.score,
        feedback: data.feedback,
      })
      dialog.showSuccess(t("evaluations.toasts.success_correct_message") || "TD corrigé avec succès.")
      correctTpModal.close()
      if (activeTab === "realisations" && user?.id) {
        const [pending, corrected] = await Promise.all([
          evaluationService.getPendingEvaluationsForInstructor(Number(user.id)),
          evaluationService.getCorrectedEvaluationsForInstructor(Number(user.id)),
        ])
        setPendingTps(
          Array.isArray(pending)
            ? pending.map((a: EvaluationAttempt) => ({
                id: a.id,
                evaluationId: a.evaluationId,
                evaluationTitle: a.evaluationTitle ?? "TD",
                learnerName: a.learnerName ?? a.learnerEmail ?? "Apprenant",
                submittedFileUrl: a.submittedFileUrl ?? undefined,
                submittedText: a.submittedText ?? undefined,
                createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "N/A",
              }))
            : []
        )
        setCorrectedTps(
          Array.isArray(corrected)
            ? corrected.map((a: EvaluationAttempt) => ({
                id: a.id,
                evaluationId: a.evaluationId,
                evaluationTitle: a.evaluationTitle ?? "TD",
                learnerName: a.learnerName ?? a.learnerEmail ?? "Apprenant",
                submittedFileUrl: a.submittedFileUrl ?? undefined,
                score: a.score ?? 0,
                feedback: a.instructorFeedback ?? undefined,
                correctedAt: a.correctedAt ? new Date(a.correctedAt).toLocaleDateString("fr-FR") : "N/A",
                createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-FR") : "N/A",
              }))
            : []
        )
      }
    } catch (err: any) {
      dialog.showError(err.message || "Erreur lors de la correction.")
    }
  }

  const columns: ColumnDef<TDDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titre",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: "Formation",
      },
      {
        accessorKey: "lesson",
        header: "Leçon",
        cell: ({ row }) => row.original.lesson || "-",
      },
      {
        accessorKey: "uploadDate",
        header: "Date de création",
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

  const pendingTpColumns: ColumnDef<PendingTpDisplay>[] = useMemo(
    () => [
      { accessorKey: "evaluationTitle", header: "TD", cell: ({ row }) => row.original.evaluationTitle },
      { accessorKey: "learnerName", header: "Apprenant", cell: ({ row }) => row.original.learnerName },
      { accessorKey: "createdAt", header: "Soumis le", cell: ({ row }) => <div className="flex items-center gap-1 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{row.original.createdAt}</div> },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const tp = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Corriger",
                  icon: <CheckCircle className="h-4 w-4" />,
                  onClick: () =>
                    correctTpModal.open({
                      id: tp.id,
                      evaluationId: tp.evaluationId,
                      userId: 0,
                      status: "PENDING" as any,
                      submittedFileUrl: tp.submittedFileUrl,
                      submittedText: tp.submittedText,
                    } as EvaluationAttempt),
                },
              ]}
            />
          )
        },
      },
    ],
    [correctTpModal]
  )

  const correctedTpColumns: ColumnDef<CorrectedTpDisplay>[] = useMemo(
    () => [
      { accessorKey: "evaluationTitle", header: "TD", cell: ({ row }) => row.original.evaluationTitle },
      { accessorKey: "learnerName", header: "Apprenant", cell: ({ row }) => row.original.learnerName },
      { accessorKey: "score", header: "Score", cell: ({ row }) => <span className="font-semibold text-orange-600">{row.original.score}/100</span> },
      { accessorKey: "correctedAt", header: "Corrigé le", cell: ({ row }) => <div className="flex items-center gap-1 text-sm"><CheckCircle2 className="h-3.5 w-3.5 text-green-600" />{row.original.correctedAt}</div> },
    ],
    []
  )

  return (
    <>
      <PageHeader
        title="Gestion des TDs"
        description="Gérez les TDs et consultez les réalisations soumises par les apprenants"
        action={activeTab === "tds" ? { label: "Ajouter un TD", onClick: () => addModal.open() } : undefined}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="bg-muted/40 border border-border/60">
          <TabsTrigger value="tds">TD</TabsTrigger>
          <TabsTrigger value="realisations">Réalisations des apprenants</TabsTrigger>
        </TabsList>

        <TabsContent value="tds" className="mt-4">
          <Card>
            <CardContent>
              <div className="mb-4">
                <SearchBar placeholder="Rechercher un TD..." value={searchQuery} onChange={setSearchQuery} />
              </div>
              {loading ? (
                <PageLoader />
              ) : error ? (
                <div className="text-center text-destructive p-4">{error}</div>
              ) : filteredData.length === 0 ? (
                <EmptyState icon={ClipboardList} title="Aucun TD" description="Commencez par ajouter un TD pour une leçon" />
              ) : (
                <DataTable columns={columns} data={Array.isArray(filteredData) ? filteredData : []} searchValue={searchQuery} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realisations" className="mt-4">
          <Card>
            <CardContent className="space-y-6">
              {loadingSubmissions ? (
                <PageLoader />
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">En attente de correction</h3>
                    {pendingTps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun TD en attente.</p>
                    ) : (
                      <DataTable columns={pendingTpColumns} data={pendingTps} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Corrigés</h3>
                    {correctedTps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun TD corrigé pour le moment.</p>
                    ) : (
                      <DataTable columns={correctedTpColumns} data={correctedTps} />
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {correctTpModal.selectedItem && (
        <CorrectTpModal
          open={correctTpModal.isOpen}
          onOpenChange={(open) => !open && correctTpModal.close()}
          attempt={correctTpModal.selectedItem}
          onSubmit={handleCorrectTp}
        />
      )}

      <TDFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un TD"
        description="Créez un nouveau TD pour une leçon"
        onSubmit={handleAddTD}
        submitLabel="Créer le TD"
      />

      {editModal.selectedItem && (
        <TDFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier le TD"
          description="Modifiez les informations du TD"
          defaultValues={{
            title: editModal.selectedItem.title,
            description: editModal.selectedItem.description || "",
            tpInstructions: editModal.selectedItem.tpInstructions || "",
            tpFileUrl: editModal.selectedItem.tpFileUrl || "",
            courseId: editModal.selectedItem.courseId,
            lessonId: editModal.selectedItem.lessonId,
          }}
          onSubmit={handleUpdateTD}
          submitLabel="Enregistrer les modifications"
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteTD}
        title="Supprimer le TD"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteModal.selectedItem?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}

