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

type Review = {
  id: number
  user: string
  course: string
}

type ApproveReviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: Review
  onConfirm: () => void
  action: "approve" | "reject"
}

export function ApproveReviewModal({
  open,
  onOpenChange,
  review,
  onConfirm,
  action,
}: ApproveReviewModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const isApprove = action === "approve"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isApprove ? "Approuver cet avis ?" : "Rejeter cet avis ?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isApprove ? (
              <>
                L'avis de <span className="font-semibold">{review.user}</span> pour la formation{" "}
                <span className="font-semibold">{review.course}</span> sera approuvé et visible publiquement.
              </>
            ) : (
              <>
                L'avis de <span className="font-semibold">{review.user}</span> pour la formation{" "}
                <span className="font-semibold">{review.course}</span> sera rejeté et ne sera pas visible publiquement.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={isApprove ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {isApprove ? "Approuver" : "Rejeter"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

