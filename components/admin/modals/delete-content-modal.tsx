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

type Content = {
  id: number
  title: string
  type: string
  course: string
}

type DeleteContentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: Content
  onConfirm: () => void
}

export function DeleteContentModal({ open, onOpenChange, content, onConfirm }: DeleteContentModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce contenu ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le contenu <span className="font-semibold">{content.title}</span> (
            {content.type}) de la formation {content.course} sera définitivement supprimé de la plateforme.
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

