"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tag, FileText, BookOpen, Hash } from "lucide-react"

type Category = {
  id: number
  name: string
  description: string
  courses: number
  color: string
}

type ViewCategoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category
}

export function ViewCategoryModal({ open, onOpenChange, category }: ViewCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${category.color}`} />
            {category.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Catégorie
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {category.courses} formations
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">Description</p>
            </div>
            <p className="text-sm text-muted-foreground pl-7">{category.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ID Catégorie</p>
                <p className="font-medium">#{category.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nombre de formations</p>
                <p className="font-bold text-lg">{category.courses}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Couleur d'identification</p>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${category.color} border-2 border-border`} />
              <p className="text-sm text-muted-foreground">Cette couleur est utilisée pour identifier visuellement cette catégorie</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

