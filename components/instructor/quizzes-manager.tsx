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
import { Edit, Trash2, HelpCircle, Clock, Calendar } from "lucide-react"
import { Evaluation, EvaluationType } from "@/models/evaluation.model"
import { evaluationService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import { QuizFormModal } from "@/components/shared/quiz-form-modal"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"

type QuizDisplay = {
  id: number
  title: string
  description?: string
  course: string
  lesson?: string
  uploadDate: string
  status: "Publié" | "Brouillon"
  questionsCount?: number
  lessonId?: number
  courseId?: number
}

const mapEvaluationToQuizDisplay = (evaluation: Evaluation): QuizDisplay => {
  return {
    id: evaluation.id || 0,
    title: evaluation.title || "Sans titre",
    description: evaluation.description || "",
    course: evaluation.course?.title || "N/A",
    lesson: (evaluation as any).lesson?.title || undefined,
    uploadDate: evaluation.createdAt 
      ? new Date(evaluation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
      : "",
    status: evaluation.activate ? "Publié" : "Brouillon",
    questionsCount: evaluation.questions?.length || 0,
    lessonId: (evaluation as any).lesson?.id || (evaluation as any).lessonId,
    courseId: evaluation.courseId,
  }
}

export function QuizzesManager() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const dialog = useActionResultDialog()
  const addModal = useModal<QuizDisplay>()
  const editModal = useModal<QuizDisplay>()
  const deleteModal = useModal<QuizDisplay>()

  const [quizzes, setQuizzes] = useState<QuizDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await evaluationService.getAllEvaluations()
      // Uniquement les quiz associés à une leçon (pas les examens de fin de cours)
      const quizEvaluations = response.filter(
        (e: Evaluation) => e.type === EvaluationType.QUIZ && (e as any).lesson != null
      )
      setQuizzes(quizEvaluations.map(mapEvaluationToQuizDisplay))
    } catch (err: any) {
      setError(err.message || "Failed to fetch quizzes.")
      console.error("Error fetching quizzes:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les quiz.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const { searchQuery, setSearchQuery, filteredData } = useSearch<QuizDisplay>({
    data: quizzes,
    searchKeys: ["title", "description", "course", "lesson"],
  })

  const handleAddQuiz = async (data: any) => {
    setError(null)
    try {
      const newQuizData = {
        title: data.title,
        description: data.description || "",
        courseId: data.courseId,
        lessonId: data.lessonId,
        type: EvaluationType.QUIZ,
        questions: data.questions || [],
      }
      const createdQuiz = await evaluationService.createEvaluation(newQuizData)
      setQuizzes((prev) => [...prev, mapEvaluationToQuizDisplay(createdQuiz)])
      addModal.close()
      dialog.showSuccess("Le quiz a été créé avec succès.")
      fetchQuizzes()
    } catch (err: any) {
      console.error("Error adding quiz:", err)
      dialog.showError(err.message || "Impossible de créer le quiz.")
    }
  }

  const handleUpdateQuiz = async (data: any) => {
    setError(null)
    if (editModal.selectedItem) {
      try {
        const updatedQuizData = {
          title: data.title,
          description: data.description || "",
          courseId: data.courseId,
          lessonId: data.lessonId,
          questions: data.questions || [],
        }
        const updatedQuiz = await evaluationService.updateEvaluation(editModal.selectedItem.id, updatedQuizData)
        setQuizzes((prev) =>
          prev.map((item) =>
            item.id === editModal.selectedItem!.id ? mapEvaluationToQuizDisplay(updatedQuiz) : item
          )
        )
        editModal.close()
        dialog.showSuccess("Le quiz a été mis à jour avec succès.")
        fetchQuizzes()
      } catch (err: any) {
        console.error("Error updating quiz:", err)
        dialog.showError(err.message || "Impossible de mettre à jour le quiz.")
      }
    }
  }

  const handleDeleteQuiz = async () => {
    setError(null)
    if (deleteModal.selectedItem) {
      try {
        await evaluationService.deleteEvaluation(deleteModal.selectedItem.id)
        setQuizzes((prev) => prev.filter((item) => item.id !== deleteModal.selectedItem!.id))
        deleteModal.close()
        dialog.showSuccess("Le quiz a été supprimé avec succès.")
      } catch (err: any) {
        console.error("Error deleting quiz:", err)
        dialog.showError(err.message || "Impossible de supprimer le quiz.")
      }
    }
  }

  const columns: ColumnDef<QuizDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Titre",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
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
        accessorKey: "questionsCount",
        header: "Questions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span>{row.original.questionsCount || 0}</span>
          </div>
        ),
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

  return (
    <>
      <PageHeader
        title="Gestion des Quiz"
        description="Gérez tous les quiz liés à vos leçons"
        action={{
          label: "Ajouter un quiz",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher un quiz..."
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
              icon={HelpCircle}
              title="Aucun quiz"
              description="Commencez par ajouter un quiz pour une leçon"
            />
          ) : (
            <DataTable columns={columns} data={Array.isArray(filteredData) ? filteredData : []} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <QuizFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter un quiz"
        description="Créez un nouveau quiz pour une leçon"
        onSubmit={handleAddQuiz}
        submitLabel="Créer le quiz"
      />

      {editModal.selectedItem && (
        <QuizFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier le quiz"
          description="Modifiez les informations du quiz"
          defaultValues={{
            title: editModal.selectedItem.title,
            description: editModal.selectedItem.description || "",
            courseId: editModal.selectedItem.courseId,
            lessonId: editModal.selectedItem.lessonId,
            questions: [], // Les questions seront chargées depuis l'évaluation lors de l'édition
          }}
          onSubmit={handleUpdateQuiz}
          submitLabel="Enregistrer les modifications"
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteQuiz}
        title="Supprimer le quiz"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteModal.selectedItem?.title}" ? Cette action est irréversible.`}
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
