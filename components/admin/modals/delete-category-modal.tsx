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

type Category = {
  id: number
  name: string
  courses: number
}

type DeleteCategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category
  onConfirm: () => void
}

export function DeleteCategoryModal({ open, onOpenChange, category, onConfirm }: DeleteCategoryModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette catégorie ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. La catégorie <span className="font-semibold">{category.name}</span> sera
            définitivement supprimée. Cette catégorie contient actuellement{" "}
            <span className="font-semibold">{category.courses} formations</span>.
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
