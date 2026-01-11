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
import { Apprenant } from "@/models/apprenant.model"
import { apprenantService } from "@/services"
import { useLanguage } from "@/contexts/language-context"

// Composant pour le contenu de la modale de progression
function LearnerCourseProgressModal({
  open,
  onOpenChange,
  learnerId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  learnerId: number | null
}) {
  const { t } = useLanguage();
  const [learnerProgress, setLearnerProgress] = useState<LearnerProgress | null>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)
  const [errorProgress, setErrorProgress] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !learnerId) {
      setLearnerProgress(null);
      return
    }

    const fetchLearnerProgressData = async () => {
      setIsLoadingProgress(true)
      setErrorProgress(null)
      try {
        const data = await analyticsService.getLearnerProgress(learnerId)
        setLearnerProgress(data)
      } catch (err: any) {
        setErrorProgress(err.message || t('analytics.learnerProgress.loadError'))
        console.error("Error fetching learner progress:", err)
      } finally {
        setIsLoadingProgress(false)
      }
    }

    fetchLearnerProgressData()
  }, [open, learnerId, t])

  if (isLoadingProgress) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('analytics.learnerProgress.loadingTitle')}</DialogTitle>
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
            <DialogTitle>{t('analytics.learnerProgress.errorTitle')}</DialogTitle>
            <DialogDescription>{errorProgress}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (!learnerProgress) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('analytics.learnerProgress.modalTitle', { name: learnerProgress.name })}</DialogTitle>
          <DialogDescription>
            {t('analytics.learnerProgress.modalDescription', { name: learnerProgress.name, email: learnerProgress.email })}
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
                {course.period && <CardDescription className="text-sm mb-2">{t('analytics.learnerProgress.period', { period: course.period })}</CardDescription>}
                <div className="flex items-center gap-2">
                  <Progress value={course.courseOverallProgress} className="w-full" />
                  <span className="text-sm text-muted-foreground">{course.courseOverallProgress}%</span>
                </div>
                <CardDescription className="mt-1 text-sm">
                  {t('analytics.learnerProgress.chaptersCompleted', { completed: course.chaptersCompleted, total: course.totalChapters })}
                </CardDescription>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">{t('analytics.learnerProgress.noCourses')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LearnerProgressList() {
  const { t } = useLanguage();
  const [apprenants, setApprenants] = useState<Apprenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const learnerProgressModal = useModal<number>() 

  const fetchAllApprenants = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apprenantService.getAllApprenants()
      if (Array.isArray(response)) {
        setApprenants(response)
      } else if (response && response.data && Array.isArray(response.data)) {
        setApprenants(response.data)
      } else {
        console.error("Unexpected response format from getAllApprenants:", response)
        setError(t('analytics.learnerProgress.list.unexpectedFormat'))
        setApprenants([])
      }
    } catch (err: any) {
      setError(err.message || t('analytics.learnerProgress.list.loadError'))
      console.error("Error fetching all apprenants:", err)
      setApprenants([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAllApprenants()
  }, [fetchAllApprenants])

  const columns: ColumnDef<Apprenant>[] = useMemo(
    () => [
      {
        accessorKey: "nom",
        header: t('analytics.learnerProgress.list.headerLearner'),
        cell: ({ row }) => {
          const fullName = `${row.original.prenom || ''} ${row.original.nom || ''}`.trim() || row.original.email || t('analytics.learnerProgress.list.noNameUser');
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
        header: t('analytics.learnerProgress.list.headerEmail'),
        cell: ({ row }) => row.original.email,
      },
      {
        id: "actions",
        header: t('analytics.learnerProgress.list.headerActions'),
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => learnerProgressModal.open(row.original.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('analytics.learnerProgress.list.viewProgressButton')}
          </Button>
        ),
      },
    ],
    [learnerProgressModal, t]
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
          <CardTitle>{t('analytics.learnerProgress.list.title')}</CardTitle>
          <CardDescription>
            {t('analytics.learnerProgress.list.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={apprenants} />
        </CardContent>
      </Card>

      <LearnerCourseProgressModal
        open={learnerProgressModal.isOpen}
        onOpenChange={learnerProgressModal.close}
        learnerId={learnerProgressModal.selectedItem}
      />
    </>
  )
}
