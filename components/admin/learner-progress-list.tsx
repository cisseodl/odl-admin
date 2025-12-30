"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Progress } from "@/components/ui/progress"
import type { ColumnDef } from "@tanstack/react-table"
import { PageLoader } from "@/components/ui/page-loader"
import { analyticsService, type LearnerProgress, type CourseProgress } from "@/services/analytics.service"
import { useModal } from "@/hooks/use-modal" // Import useModal
import { Button } from "@/components/ui/button"
import { Eye, BookOpen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog" // Import Dialog components

// Define a new component for the modal content
function LearnerCourseProgressModal({
  open,
  onOpenChange,
  learner,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  learner: LearnerProgress | null
}) {
  if (!learner) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Progression des cours pour {learner.name}</DialogTitle>
          <DialogDescription>
            Aperçu détaillé de la progression de {learner.name} dans chaque cours inscrit.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {learner.courses.length > 0 ? (
            learner.courses.map((course) => (
              <Card key={course.courseId} className="p-4">
                <CardTitle className="text-base flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  {course.courseTitle}
                </CardTitle>
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
  const [data, setData] = useState<LearnerProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const learnerDetailsModal = useModal<LearnerProgress>() // Instance of the modal

  useEffect(() => {
    const fetchLearnerProgress = async () => {
      try {
        setLoading(true)
        setError(null)
        const progressData = await analyticsService.getLearnerProgress()
        setData(progressData)
      } catch (err) {
        setError("Impossible de charger les données de progression des apprenants.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLearnerProgress()
  }, [])

  const columns: ColumnDef<LearnerProgress>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Apprenant",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        ),
      },
      {
        accessorKey: "coursesEnrolled",
        header: "Cours Inscrits",
        cell: ({ row }) => <div className="text-center">{row.original.coursesEnrolled}</div>,
      },
      {
        accessorKey: "coursesCompleted",
        header: "Cours Terminés",
        cell: ({ row }) => <div className="text-center">{row.original.coursesCompleted}</div>,
      },
      {
        accessorKey: "overallProgress",
        header: "Progression Globale",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Progress value={row.original.overallProgress} className="w-[60%]" />
            <span className="text-sm text-muted-foreground">{row.original.overallProgress}%</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => learnerDetailsModal.open(row.original)} // Open modal on click
          >
            <Eye className="h-4 w-4 mr-2" />
            Détails
          </Button>
        ),
      },
    ],
    [learnerDetailsModal] // Re-render columns if modal instance changes
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
            Suivez la progression, l'achèvement des cours et l'engagement de chaque apprenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>

      {/* Course Progress Modal */}
      <LearnerCourseProgressModal
        open={learnerDetailsModal.isOpen}
        onOpenChange={learnerDetailsModal.close}
        learner={learnerDetailsModal.selectedItem}
      />
    </>
  )
}
