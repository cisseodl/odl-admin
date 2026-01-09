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

type Instructor = {
  id: number
  name: string
  email: string
}

type DeleteInstructorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  instructor: Instructor
  onConfirm: () => void
}

export function DeleteInstructorModal({
  open,
  onOpenChange,
  instructor,
  onConfirm,
}: DeleteInstructorModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce formateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le formateur <span className="font-semibold">{instructor.name}</span> (
            {instructor.email}) sera définitivement supprimé de la plateforme.
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

