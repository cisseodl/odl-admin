"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Course = {
  id: number
  title: string
  students: number
}

type DeleteCourseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
  onConfirm: () => void
}

export function DeleteCourseModal({ open, onOpenChange, course, onConfirm }: DeleteCourseModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette formation ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. La formation <span className="font-semibold">{course.title}</span> et toutes
            ses données seront définitivement supprimées. Cette formation compte actuellement{" "}
            <span className="font-semibold">{course.students} étudiants inscrits</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
