"use client"

import type React from "react"

import { useState } from "react"
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

type AddCourseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCourse: (course: {
    title: string
    instructor: string
    category: string
    status: "Publié" | "Brouillon" | "En révision"
    duration: string
  }) => void
}

export function AddCourseModal({ open, onOpenChange, onAddCourse }: AddCourseModalProps) {
  const [title, setTitle] = useState("")
  const [instructor, setInstructor] = useState("")
  const [category, setCategory] = useState("")
  const [duration, setDuration] = useState("")
  const [status, setStatus] = useState<"Publié" | "Brouillon" | "En révision">("Brouillon")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddCourse({
      title,
      instructor,
      category,
      status,
      duration,
    })
    setTitle("")
    setInstructor("")
    setCategory("")
    setDuration("")
    setStatus("Brouillon")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter une formation</DialogTitle>
          <DialogDescription>Créez une nouvelle formation sur la plateforme</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre de la formation</Label>
              <Input
                id="title"
                placeholder="Formation React Avancé"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructor">Instructeur</Label>
              <Input
                id="instructor"
                placeholder="Nom de l'instructeur"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  placeholder="Développement Web"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Durée</Label>
                <Input
                  id="duration"
                  placeholder="10h 30min"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
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
            <Button type="submit">Créer la formation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
