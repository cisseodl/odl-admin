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
import type { Categorie } from "@/models"

export type AddCoursePayload = {
  title: string
  instructorId: number
  categoryId: number
  status: "Brouillon" | "En révision" | "Publié"
  duration?: string
}

type AddCourseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCourse: (course: AddCoursePayload) => void
  categories: Categorie[]
  instructors: Array<{ id?: number; userId?: number; fullName?: string; name?: string; email?: string }>
}

export function AddCourseModal({ open, onOpenChange, onAddCourse, categories, instructors }: AddCourseModalProps) {
  const [title, setTitle] = useState("")
  const [instructorId, setInstructorId] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [duration, setDuration] = useState("")
  const [status, setStatus] = useState<"Brouillon" | "En révision" | "Publié">("Brouillon")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!instructorId || !categoryId) return
    onAddCourse({
      title,
      instructorId: Number(instructorId),
      categoryId: Number(categoryId),
      status,
      duration: duration || undefined,
    })
    setTitle("")
    setInstructorId("")
    setCategoryId("")
    setDuration("")
    setStatus("Brouillon")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un cours</DialogTitle>
          <DialogDescription>
            Créez un nouveau cours et assignez un instructeur. Seul l&apos;instructeur pourra ajouter les modules, leçons et quiz, puis publier le cours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre du cours</Label>
              <Input
                id="title"
                placeholder="Ex. React Avancé"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructor">Instructeur</Label>
              <Select value={instructorId} onValueChange={setInstructorId} required>
                <SelectTrigger id="instructor">
                  <SelectValue placeholder="Choisir un instructeur" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((inst) => {
                    const uid = inst.userId ?? inst.id
                    if (uid == null) return null
                    return (
                      <SelectItem key={uid} value={String(uid)}>
                        {inst.fullName ?? inst.name ?? inst.email ?? `Instructeur #${uid}`}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Durée (optionnel)</Label>
              <Input
                id="duration"
                placeholder="Ex. 10h 30min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as "Brouillon" | "En révision" | "Publié")}>
                <SelectTrigger id="status">
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer le cours</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
