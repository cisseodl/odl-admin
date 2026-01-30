"use client"

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ActionResultDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  isSuccess: boolean
  title?: string
  message: string
  onConfirm?: () => void
  confirmLabel?: string
}

export function ActionResultDialog({
  isOpen,
  onOpenChange,
  isSuccess,
  title,
  message,
  onConfirm,
  confirmLabel = "Fermer",
}: ActionResultDialogProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center text-center p-6">
          {isSuccess ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <DialogTitle className="text-2xl font-bold">
                {title || "Opération Réussie !"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                {message}
              </DialogDescription>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <DialogTitle className="text-2xl font-bold">
                {title || "Erreur"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                {message}
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        <DialogFooter className="flex justify-center p-4">
          <Button 
            onClick={handleConfirm}
            variant={isSuccess ? "default" : "destructive"}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
