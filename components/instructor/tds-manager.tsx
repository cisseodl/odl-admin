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
import { Edit, Trash2, ClipboardList, Clock, Calendar } from "lucide-react"
import { Evaluation, EvaluationType } from "@/models/evaluation.model"
import { evaluationService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import { TDFormModal } from "@/components/shared/td-form-modal"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const addModal = useModal<TDDisplay>()
  const editModal = useModal<TDDisplay>()
  const deleteModal = useModal<TDDisplay>()

  const [tds, setTds] = useState<TDDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTDs()
  }, [])

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
      toast({
        title: "Succès",
        description: "Le TD a été créé avec succès.",
      })
      fetchTDs()
    } catch (err: any) {
      setError(err.message || "Failed to add TD.")
      console.error("Error adding TD:", err)
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le TD.",
        variant: "destructive",
      })
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
        toast({
          title: "Succès",
          description: "Le TD a été mis à jour avec succès.",
        })
        fetchTDs()
      } catch (err: any) {
        setError(err.message || "Failed to update TD.")
        console.error("Error updating TD:", err)
        toast({
          title: "Erreur",
          description: err.message || "Impossible de mettre à jour le TD.",
          variant: "destructive",
        })
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
        toast({
          title: "Succès",
          description: "Le TD a été supprimé avec succès.",
        })
      } catch (err: any) {
        setError(err.message || "Failed to delete TD.")
        console.error("Error deleting TD:", err)
        toast({
          title: "Erreur",
          description: err.message || "Impossible de supprimer le TD.",
          variant: "destructive",
        })
      }
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

  return (
    <>
      <PageHeader
        title="Gestion des TDs"
        description="Gérez tous les TDs (Travaux Dirigés) liés à vos leçons"
        action={{
          label: "Ajouter un TD",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher un TD..."
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
              icon={ClipboardList}
              title="Aucun TD"
              description="Commencez par ajouter un TD pour une leçon"
            />
          ) : (
            <DataTable columns={columns} data={Array.isArray(filteredData) ? filteredData : []} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

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

