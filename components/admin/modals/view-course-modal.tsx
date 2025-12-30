"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, Star } from "lucide-react"

type Course = {
  id: number
  title: string
  instructor: string
  category: string
  students: number
  status: "Publié" | "Brouillon" | "En révision"
  duration: string
  rating: number
}

type ViewCourseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
}

export function ViewCourseModal({ open, onOpenChange, course }: ViewCourseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{course.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={course.status === "Publié" ? "default" : course.status === "Brouillon" ? "secondary" : "outline"}
            >
              {course.status}
            </Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Instructeur</p>
              <p className="font-medium">{course.instructor}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <p className="font-medium">{course.category}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <p className="font-bold">{course.students}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
              <div>
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-bold">{course.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <p className="font-bold">{course.rating > 0 ? `${course.rating}/5` : "Pas encore noté"}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">
              Formation complète et pratique qui couvre tous les aspects essentiels. Idéal pour les débutants et
              intermédiaires souhaitant approfondir leurs connaissances.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
