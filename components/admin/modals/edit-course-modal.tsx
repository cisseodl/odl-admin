"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

type EditCourseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
  onUpdateCourse: (course: Course) => void
}

export function EditCourseModal({ open, onOpenChange, course, onUpdateCourse }: EditCourseModalProps) {
  const [title, setTitle] = useState(course.title)
  const [instructor, setInstructor] = useState(course.instructor)
  const [category, setCategory] = useState(course.category)
  const [duration, setDuration] = useState(course.duration)
  const [status, setStatus] = useState(course.status)

  useEffect(() => {
    setTitle(course.title)
    setInstructor(course.instructor)
    setCategory(course.category)
    setDuration(course.duration)
    setStatus(course.status)
  }, [course])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateCourse({
      ...course,
      title,
      instructor,
      category,
      duration,
      status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier la formation</DialogTitle>
          <DialogDescription>Modifiez les informations de la formation</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Titre de la formation</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-instructor">Instructeur</Label>
              <Input id="edit-instructor" value={instructor} onChange={(e) => setInstructor(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Catégorie</Label>
                <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Durée</Label>
                <Input id="edit-duration" value={duration} onChange={(e) => setDuration(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Statut</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brouillon">Brouillon</SelectItem>
                    <SelectItem value="En révision">En révision</SelectItem>
                    <SelectItem value="Publié">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
