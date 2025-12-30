// components/admin/cohortes/modals/view-cohorte-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Clock, FileText } from "lucide-react"
import type { CohorteDisplay } from "../../cohortes-list" // Assuming CohorteDisplay is exported from here

type ViewCohorteModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cohorte: CohorteDisplay
}

export function ViewCohorteModal({ open, onOpenChange, cohorte }: ViewCohorteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            {cohorte.nom}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                cohorte.status === "Active" ? "default" : cohorte.status === "Terminée" ? "secondary" : "outline"
              }
            >
              {cohorte.status}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">{cohorte.description || "Aucune description fournie."}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date de début</p>
                <p className="font-medium">{cohorte.dateDebut}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date de fin</p>
                <p className="font-medium">{cohorte.dateFin}</p>
              </div>
            </div>
          </div>
          
          {/* Placeholder for learners associated with this cohorte */}
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Apprenants de la cohorte
            </p>
            <p className="text-sm text-muted-foreground">
              (Affichage des apprenants non implémenté. Nécessite l'intégration des endpoints des apprenants par cohorte.)
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
