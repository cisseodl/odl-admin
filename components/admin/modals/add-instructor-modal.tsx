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
import { Textarea } from "@/components/ui/textarea"

type AddInstructorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddInstructor: (instructor: {
    name: string
    email: string
    specialization: string
    status: "Actif" | "Inactif" | "En attente"
    bio?: string
  }) => void
}

export function AddInstructorModal({ open, onOpenChange, onAddInstructor }: AddInstructorModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [status, setStatus] = useState<"Actif" | "Inactif" | "En attente">("En attente")
  const [bio, setBio] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddInstructor({ name, email, specialization, status, bio })
    setName("")
    setEmail("")
    setSpecialization("")
    setStatus("En attente")
    setBio("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un formateur</DialogTitle>
          <DialogDescription>Créez un nouveau compte formateur sur la plateforme</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Jean Martin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.martin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specialization">Spécialisation</Label>
              <Input
                id="specialization"
                placeholder="Développement Web"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
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
            <div className="grid gap-2">
              <Label htmlFor="bio">Biographie (optionnel)</Label>
              <Textarea
                id="bio"
                placeholder="Description du formateur..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer le formateur</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

