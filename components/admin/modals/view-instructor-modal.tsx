"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Briefcase, BookOpen, Users, Star, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react"

type Instructor = {
  id: number
  name: string
  email: string
  specialization: string
  courses: number
  students: number
  rating: number
  status: "Actif" | "Inactif" | "En attente"
  joinedDate: string
  avatar?: string
}

type ViewInstructorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  instructor: Instructor
}

export function ViewInstructorModal({ open, onOpenChange, instructor }: ViewInstructorModalProps) {
  const getStatusIcon = () => {
    switch (instructor.status) {
      case "Actif":
        return <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
      case "Inactif":
        return <XCircle className="h-5 w-5 text-muted-foreground" />
      default:
        return <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
      />
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Avatar>
              <AvatarImage src={instructor.avatar} alt={instructor.name} />
              <AvatarFallback>
                {instructor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {instructor.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                instructor.status === "Actif" ? "default" : instructor.status === "Inactif" ? "secondary" : "outline"
              }
              className="flex items-center gap-1"
            >
              {getStatusIcon()}
              {instructor.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {instructor.specialization}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{instructor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date d'inscription</p>
                <p className="font-medium">{instructor.joinedDate}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Formations créées</p>
                <p className="font-bold text-lg">{instructor.courses}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[hsl(var(--success))]" />
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <p className="font-bold text-lg">{instructor.students}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">{instructor.rating}</p>
                  <div className="flex items-center gap-0.5">{renderStars(Math.round(instructor.rating))}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ID Instructeur</p>
                <p className="font-medium">#{instructor.id}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Spécialisation</p>
            <p className="text-sm text-muted-foreground">
              Expert en {instructor.specialization} avec {instructor.courses} formations créées et{" "}
              {instructor.students} étudiants formés.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

