// components/admin/rubriques/modals/view-rubrique-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Image as ImageIcon, FileText, Target, Users, Clock, Link as LinkIcon } from "lucide-react"
import type { RubriqueDisplay } from "../../rubriques-list" // Import RubriqueDisplay

type ViewRubriqueModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  rubrique: RubriqueDisplay
}

export function ViewRubriqueModal({ open, onOpenChange, rubrique }: ViewRubriqueModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            {rubrique.rubrique}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {rubrique.image && (
            <div className="flex justify-center">
              <img src={rubrique.image} alt={rubrique.rubrique} className="max-h-48 object-contain rounded-md" />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">{rubrique.description || "Aucune description fournie."}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Objectifs</p>
              <p className="font-medium">{rubrique.objectifs || "Non spécifié"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Public Cible</p>
              <p className="font-medium">{rubrique.publicCible || "Non spécifié"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durée / Format</p>
              <p className="font-medium">{rubrique.dureeFormat || "Non spécifié"}</p>
            </div>
            {rubrique.lien_ressources && (
              <div>
                <p className="text-sm font-medium">Lien Ressources</p>
                <a href={rubrique.lien_ressources} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" /> Voir les ressources
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
