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

type Certification = {
  id: number
  name: string
  course: string
}

type DeleteCertificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  certification: Certification
  onConfirm: () => void
}

export function DeleteCertificationModal({
  open,
  onOpenChange,
  certification,
  onConfirm,
}: DeleteCertificationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette certification ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. La certification <span className="font-semibold">{certification.name}</span>{" "}
            pour la formation {certification.course} sera définitivement supprimée de la plateforme.
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

