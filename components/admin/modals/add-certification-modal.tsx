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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type AddCertificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCertification: (certification: {
    name: string
    course: string
    validUntil: string
    status: "Actif" | "Expiré" | "En attente"
    requirements: string
  }) => void
}

export function AddCertificationModal({
  open,
  onOpenChange,
  onAddCertification,
}: AddCertificationModalProps) {
  const [name, setName] = useState("")
  const [course, setCourse] = useState("")
  const [validUntil, setValidUntil] = useState<Date | undefined>(undefined)
  const [status, setStatus] = useState<"Actif" | "Expiré" | "En attente">("Actif")
  const [requirements, setRequirements] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validUntil) return
    onAddCertification({
      name,
      course,
      validUntil: format(validUntil, "dd MMM yyyy"),
      status,
      requirements,
    })
    setName("")
    setCourse("")
    setValidUntil(undefined)
    setStatus("Actif")
    setRequirements("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer une certification</DialogTitle>
          <DialogDescription>Créez une nouvelle certification pour la plateforme</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la certification</Label>
              <Input
                id="name"
                placeholder="Certification React Avancé"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course">Formation associée</Label>
              <Input
                id="course"
                placeholder="Formation React Avancé"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validUntil">Validité jusqu'au</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validUntil && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validUntil ? format(validUntil, "PPP") : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={validUntil} onSelect={setValidUntil} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
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
              <Label htmlFor="requirements">Exigences</Label>
              <Textarea
                id="requirements"
                placeholder="80% de réussite minimum"
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
            <Button type="submit" disabled={!validUntil}>
              Créer la certification
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

