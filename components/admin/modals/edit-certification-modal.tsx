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

type Certification = {
  id: number
  name: string
  course: string
  issued: number
  validUntil: string
  status: "Actif" | "Expiré" | "En attente"
  requirements: string
}

type EditCertificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  certification: Certification
  onUpdateCertification: (certification: Certification) => void
}

export function EditCertificationModal({
  open,
  onOpenChange,
  certification,
  onUpdateCertification,
}: EditCertificationModalProps) {
  const [name, setName] = useState(certification.name)
  const [course, setCourse] = useState(certification.course)
  const [validUntil, setValidUntil] = useState(certification.validUntil)
  const [status, setStatus] = useState(certification.status)
  const [requirements, setRequirements] = useState(certification.requirements)

  useEffect(() => {
    setName(certification.name)
    setCourse(certification.course)
    setValidUntil(certification.validUntil)
    setStatus(certification.status)
    setRequirements(certification.requirements)
  }, [certification])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateCertification({
      ...certification,
      name,
      course,
      validUntil,
      status,
      requirements,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la certification</DialogTitle>
          <DialogDescription>Modifiez les informations de la certification</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom de la certification</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-course">Formation associée</Label>
              <Input id="edit-course" value={course} onChange={(e) => setCourse(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-validUntil">Validité jusqu'au</Label>
              <Input
                id="edit-validUntil"
                placeholder="31 Déc 2025"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
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
                  <SelectItem value="Expiré">Expiré</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-requirements">Exigences</Label>
              <Textarea
                id="edit-requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                required
              />
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

