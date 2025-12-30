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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AddCategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCategory: (category: { name: string; description: string; color: string }) => void
}

const colors = [
  { name: "Bleu", value: "bg-blue-500" },
  { name: "Vert", value: "bg-green-500" },
  { name: "Violet", value: "bg-purple-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Rouge", value: "bg-red-500" },
  { name: "Rose", value: "bg-pink-500" },
  { name: "Jaune", value: "bg-yellow-500" },
  { name: "Cyan", value: "bg-cyan-500" },
]

export function AddCategoryModal({ open, onOpenChange, onAddCategory }: AddCategoryModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("bg-primary")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddCategory({ name, description, color })
    setName("")
    setDescription("")
    setColor("bg-primary")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une catégorie</DialogTitle>
          <DialogDescription>Créez une nouvelle catégorie pour organiser les formations</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                placeholder="Développement Web"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la catégorie..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Couleur</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${c.value}`} />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer la catégorie</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
