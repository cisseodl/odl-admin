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
import { Textarea } from "@/components/ui/textarea"

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

type EditInstructorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  instructor: Instructor
  onUpdateInstructor: (instructor: Instructor) => void
}

export function EditInstructorModal({
  open,
  onOpenChange,
  instructor,
  onUpdateInstructor,
}: EditInstructorModalProps) {
  const [name, setName] = useState(instructor.name)
  const [email, setEmail] = useState(instructor.email)
  const [specialization, setSpecialization] = useState(instructor.specialization)
  const [status, setStatus] = useState(instructor.status)

  useEffect(() => {
    setName(instructor.name)
    setEmail(instructor.email)
    setSpecialization(instructor.specialization)
    setStatus(instructor.status)
  }, [instructor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateInstructor({
      ...instructor,
      name,
      email,
      specialization,
      status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'instructeur</DialogTitle>
          <DialogDescription>Modifiez les informations de l'instructeur</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom complet</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-specialization">Spécialisation</Label>
              <Input
                id="edit-specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Statut</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="Inactif">Inactif</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                </SelectContent>
              </Select>
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

