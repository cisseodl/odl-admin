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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Category = {
  id: number
  name: string
  description: string
  courses: number
  color: string
}

type EditCategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category
  onUpdateCategory: (category: Category) => void
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

export function EditCategoryModal({ open, onOpenChange, category, onUpdateCategory }: EditCategoryModalProps) {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description)
  const [color, setColor] = useState(category.color)

  useEffect(() => {
    setName(category.name)
    setDescription(category.description)
    setColor(category.color)
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateCategory({
      ...category,
      name,
      description,
      color,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
          <DialogDescription>Modifiez les informations de la catégorie</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom de la catégorie</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-color">Couleur</Label>
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
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
