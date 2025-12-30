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

type AddContentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddContent: (content: {
    title: string
    type: "Vidéo" | "Document" | "Image" | "Quiz"
    course: string
    duration?: string
    size?: string
    status: "Publié" | "Brouillon"
  }) => void
}

export function AddContentModal({ open, onOpenChange, onAddContent }: AddContentModalProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"Vidéo" | "Document" | "Image" | "Quiz">("Vidéo")
  const [course, setCourse] = useState("")
  const [duration, setDuration] = useState("")
  const [size, setSize] = useState("")
  const [status, setStatus] = useState<"Publié" | "Brouillon">("Brouillon")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddContent({
      title,
      type,
      course,
      duration: type === "Vidéo" ? duration : undefined,
      size: type === "Document" || type === "Image" ? size : undefined,
      status,
    })
    setTitle("")
    setType("Vidéo")
    setCourse("")
    setDuration("")
    setSize("")
    setStatus("Brouillon")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter du contenu</DialogTitle>
          <DialogDescription>Ajoutez un nouveau contenu à la plateforme</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Introduction à React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vidéo">Vidéo</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course">Formation</Label>
              <Input
                id="course"
                placeholder="Formation React Avancé"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </div>
            {type === "Vidéo" && (
              <div className="grid gap-2">
                <Label htmlFor="duration">Durée (mm:ss)</Label>
                <Input
                  id="duration"
                  placeholder="15:30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            )}
            {(type === "Document" || type === "Image") && (
              <div className="grid gap-2">
                <Label htmlFor="size">Taille</Label>
                <Input
                  id="size"
                  placeholder="2.5 MB"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Publié">Publié</SelectItem>
                  <SelectItem value="Brouillon">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

