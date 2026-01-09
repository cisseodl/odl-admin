"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Progress } from "@/components/ui/progress"
import type { ColumnDef } from "@tanstack/react-table"
import { PageLoader } from "@/components/ui/page-loader"
import { analyticsService, type LearnerProgress, type CourseProgress } from "@/services/analytics.service"
import { useModal } from "@/hooks/use-modal"
import { Button } from "@/components/ui/button"
import { Eye, BookOpen, Mail } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Apprenant } from "@/models/apprenant.model" // Import du modèle Apprenant
import { apprenantService } from "@/services" // Import du service apprenant

// Composant pour le contenu de la modale de progression
function LearnerCourseProgressModal({
  open,
  onOpenChange,
  learnerId, // Reçoit maintenant l'ID de l'apprenant
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  learnerId: number | null
}) {
  const [learnerProgress, setLearnerProgress] = useState<LearnerProgress | null>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [errorProgress, setErrorProgress] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !learnerId) {
      setLearnerProgress(null); // Reset progress data when modal closes or no learnerId
      return
    }

    const fetchLearnerProgressData = async () => {
      setIsLoadingProgress(true)
      setErrorProgress(null)
      try {
        const data = await analyticsService.getLearnerProgress(learnerId) // Appel avec l'ID
        setLearnerProgress(data)
      } catch (err: any) {
        setErrorProgress(err.message || "Impossible de charger la progression de l'apprenant.")
        console.error("Error fetching learner progress:", err)
      } finally {
        setIsLoadingProgress(false)
      }
    }

    fetchLearnerProgressData()
  }, [open, learnerId]) // Dépendances de l'effet

  if (isLoadingProgress) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chargement de la Progression</DialogTitle>
          </DialogHeader>
          <PageLoader />
        </DialogContent>
      </Dialog>
    )
  }

  if (errorProgress) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erreur de Chargement</DialogTitle>
            <DialogDescription>{errorProgress}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (!learnerProgress) return null // Should be handled by isLoadingProgress and errorProgress

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Progression des cours pour {learnerProgress.name}</DialogTitle>
          <DialogDescription>
            Aperçu détaillé de la progression de {learnerProgress.name} ({learnerProgress.email}) dans chaque cours inscrit.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {learnerProgress.courses && learnerProgress.courses.length > 0 ? (
            learnerProgress.courses.map((course) => (
              <Card key={course.courseId} className="p-4">
                <CardTitle className="text-base flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  {course.courseTitle}
                </CardTitle>
                {course.period && <CardDescription className="text-sm mb-2">Période: {course.period}</CardDescription>}
                <div className="flex items-center gap-2">
                  <Progress value={course.courseOverallProgress} className="w-full" />
                  <span className="text-sm text-muted-foreground">{course.courseOverallProgress}%</span>
                </div>
                <CardDescription className="mt-1 text-sm">
                  {course.chaptersCompleted} / {course.totalChapters} chapitres terminés
                </CardDescription>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Aucun cours inscrit pour cet apprenant.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LearnerProgressList() {
  const [apprenants, setApprenants] = useState<Apprenant[]>([]) // Stocke la liste des apprenants
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Utilise l'ID de l'apprenant pour la modale
  const learnerProgressModal = useModal<number>() 

  const fetchAllApprenants = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apprenantService.getAllApprenants() // Appelle le service pour tous les apprenants
      // getAllApprenants() retourne déjà response.data || response, donc c'est directement un tableau ou un objet
      if (Array.isArray(response)) {
        setApprenants(response)
      } else if (response && response.data && Array.isArray(response.data)) {
        setApprenants(response.data)
      } else {
        console.error("Unexpected response format from getAllApprenants:", response)
        setError("Format de données inattendu pour les apprenants.")
        setApprenants([])
      }
    } catch (err: any) {
      setError(err.message || "Impossible de charger la liste des apprenants.")
      console.error("Error fetching all apprenants:", err)
      setApprenants([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllApprenants()
  }, [fetchAllApprenants])

  const columns: ColumnDef<Apprenant>[] = useMemo(
    () => [
      {
        accessorKey: "nom",
        header: "Apprenant",
        cell: ({ row }) => {
          const fullName = `${row.original.prenom || ''} ${row.original.nom || ''}`.trim() || row.original.email || "Utilisateur sans nom";
          return (
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email, // Afficher l'email dans une colonne séparée si désiré
      },
      // Ces colonnes ne sont pas directement dans Apprenant, elles seront dans LearnerProgress
      // {
      //   accessorKey: "coursesEnrolled",
      //   header: "Cours Inscrits",
      //   cell: ({ row }) => <div className="text-center">{row.original.coursesEnrolled || 0}</div>,
      // },
      // {
      //   accessorKey: "overallProgress",
      //   header: "Progression Globale",
      //   cell: ({ row }) => (
      //     <div className="flex items-center gap-2">
      //       <Progress value={row.original.overallProgress || 0} className="w-[60%]" />
      //       <span className="text-sm text-muted-foreground">{row.original.overallProgress || 0}%</span>
      //     </div>
      //   ),
      // },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => learnerProgressModal.open(row.original.id)} // Passe l'ID de l'apprenant
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir Progression
          </Button>
        ),
      },
    ],
    [learnerProgressModal]
  )

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return <div className="text-destructive text-center p-4">{error}</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Progression des Apprenants</CardTitle>
          <CardDescription>
            Consultez la liste des apprenants et leur progression détaillée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={apprenants} />
        </CardContent>
      </Card>

      {/* Modale de Progression de l'Apprenant */}
      <LearnerCourseProgressModal
        open={learnerProgressModal.isOpen}
        onOpenChange={learnerProgressModal.close}
        learnerId={learnerProgressModal.selectedItem} // Passe l'ID de l'apprenant
      />
    </>
  )
}
