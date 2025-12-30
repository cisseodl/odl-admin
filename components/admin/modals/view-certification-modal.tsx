"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Award, BookOpen, Users, Calendar, FileCheck, CheckCircle2, XCircle, Clock } from "lucide-react"

type Certification = {
  id: number
  name: string
  course: string
  issued: number
  validUntil: string
  status: "Actif" | "Expiré" | "En attente"
  requirements: string
}

type ViewCertificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  certification: Certification
}

export function ViewCertificationModal({ open, onOpenChange, certification }: ViewCertificationModalProps) {
  const getStatusIcon = () => {
    switch (certification.status) {
      case "Actif":
        return <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
      case "Expiré":
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            {certification.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                certification.status === "Actif"
                  ? "default"
                  : certification.status === "Expiré"
                    ? "destructive"
                    : "outline"
              }
              className="flex items-center gap-1"
            >
              {getStatusIcon()}
              {certification.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {certification.course}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">Formation associée</p>
            </div>
            <p className="text-sm text-muted-foreground pl-7">{certification.course}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Certifications délivrées</p>
                <p className="font-bold text-lg">{certification.issued}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[hsl(var(--warning))]" />
              <div>
                <p className="text-sm text-muted-foreground">Validité jusqu'au</p>
                <p className="font-medium">{certification.validUntil}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">Exigences pour obtenir la certification</p>
            </div>
            <p className="text-sm text-muted-foreground pl-7">{certification.requirements}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Informations complémentaires</p>
            <p className="text-sm text-muted-foreground">
              Cette certification a été délivrée à {certification.issued} étudiant{certification.issued > 1 ? "s" : ""}{" "}
              ayant complété la formation "{certification.course}" et satisfait aux exigences requises.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

