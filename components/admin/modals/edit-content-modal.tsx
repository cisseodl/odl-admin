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

type Content = {
  id: number
  title: string
  type: "Vidéo" | "Document" | "Image" | "Quiz"
  course: string
  duration?: string
  size?: string
  status: "Publié" | "Brouillon"
  uploadDate: string
}

type EditContentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: Content
  onUpdateContent: (content: Content) => void
}

export function EditContentModal({ open, onOpenChange, content, onUpdateContent }: EditContentModalProps) {
  const [title, setTitle] = useState(content.title)
  const [type, setType] = useState(content.type)
  const [course, setCourse] = useState(content.course)
  const [duration, setDuration] = useState(content.duration || "")
  const [size, setSize] = useState(content.size || "")
  const [status, setStatus] = useState(content.status)

  useEffect(() => {
    setTitle(content.title)
    setType(content.type)
    setCourse(content.course)
    setDuration(content.duration || "")
    setSize(content.size || "")
    setStatus(content.status)
  }, [content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateContent({
      ...content,
      title,
      type,
      course,
      duration: type === "Vidéo" ? duration : undefined,
      size: type === "Document" || type === "Image" ? size : undefined,
      status,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le contenu</DialogTitle>
          <DialogDescription>Modifiez les informations du contenu</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Titre</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
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
              <Label htmlFor="edit-course">Formation</Label>
              <Input id="edit-course" value={course} onChange={(e) => setCourse(e.target.value)} required />
            </div>
            {type === "Vidéo" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Durée (mm:ss)</Label>
                <Input
                  id="edit-duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            )}
            {(type === "Document" || type === "Image") && (
              <div className="grid gap-2">
                <Label htmlFor="edit-size">Taille</Label>
                <Input id="edit-size" value={size} onChange={(e) => setSize(e.target.value)} />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Statut</Label>
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
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

