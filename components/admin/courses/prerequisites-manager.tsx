"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Prerequisite = {
  id: string
  courseId: number
  courseTitle: string
  type: "required" | "recommended"
  description?: string
}

type PrerequisitesManagerProps = {
  courseId?: number
  prerequisites?: Prerequisite[]
  availableCourses?: Array<{ id: number; title: string }>
  onPrerequisitesChange?: (prerequisites: Prerequisite[]) => void
}

export function PrerequisitesManager({
  courseId,
  prerequisites = [],
  availableCourses = [],
  onPrerequisitesChange,
}: PrerequisitesManagerProps) {
  const [localPrerequisites, setLocalPrerequisites] = useState<Prerequisite[]>(prerequisites)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [prerequisiteType, setPrerequisiteType] = useState<"required" | "recommended">("required")
  const [description, setDescription] = useState("")

  const handleAddPrerequisite = () => {
    if (!selectedCourseId) return

    const course = availableCourses.find((c) => c.id === Number(selectedCourseId))
    if (!course) return

    // Vérifier si le prérequis existe déjà
    if (localPrerequisites.some((p) => p.courseId === course.id)) {
      return
    }

    const newPrerequisite: Prerequisite = {
      id: `prereq-${Date.now()}`,
      courseId: course.id,
      courseTitle: course.title,
      type: prerequisiteType,
      description: description || undefined,
    }

    const updated = [...localPrerequisites, newPrerequisite]
    setLocalPrerequisites(updated)
    onPrerequisitesChange?.(updated)

    // Reset form
    setSelectedCourseId("")
    setDescription("")
    setPrerequisiteType("required")
  }

  const handleRemovePrerequisite = (id: string) => {
    const updated = localPrerequisites.filter((p) => p.id !== id)
    setLocalPrerequisites(updated)
    onPrerequisitesChange?.(updated)
  }

  const handleTypeChange = (id: string, type: "required" | "recommended") => {
    const updated = localPrerequisites.map((p) => (p.id === id ? { ...p, type } : p))
    setLocalPrerequisites(updated)
    onPrerequisitesChange?.(updated)
  }

  const requiredCount = localPrerequisites.filter((p) => p.type === "required").length
  const recommendedCount = localPrerequisites.filter((p) => p.type === "recommended").length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Prérequis de la formation
          </CardTitle>
          <CardDescription>
            Définissez les formations que les apprenants doivent avoir complétées avant de commencer celle-ci
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistiques */}
          {localPrerequisites.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[hsl(var(--warning))]" />
                <span className="text-sm font-medium">{requiredCount}</span>
                <span className="text-xs text-muted-foreground">requis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{recommendedCount}</span>
                <span className="text-xs text-muted-foreground">recommandés</span>
              </div>
            </div>
          )}

          {/* Liste des prérequis */}
          {localPrerequisites.length > 0 ? (
            <div className="space-y-2">
              {localPrerequisites.map((prereq) => (
                <div
                  key={prereq.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant={prereq.type === "required" ? "destructive" : "secondary"}>
                      {prereq.type === "required" ? "Requis" : "Recommandé"}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{prereq.courseTitle}</p>
                      {prereq.description && (
                        <p className="text-xs text-muted-foreground">{prereq.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={prereq.type}
                      onValueChange={(value) => handleTypeChange(prereq.id, value as "required" | "recommended")}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Requis</SelectItem>
                        <SelectItem value="recommended">Recommandé</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePrerequisite(prereq.id)}
                      aria-label="Supprimer le prérequis"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aucun prérequis défini</p>
            </div>
          )}

          {/* Formulaire d'ajout */}
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prerequisite-course">Formation</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger id="prerequisite-course">
                    <SelectValue placeholder="Sélectionner une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses
                      .filter((c) => !localPrerequisites.some((p) => p.courseId === c.id))
                      .map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prerequisite-type">Type</Label>
                <Select
                  value={prerequisiteType}
                  onValueChange={(value) => setPrerequisiteType(value as "required" | "recommended")}
                >
                  <SelectTrigger id="prerequisite-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Requis</SelectItem>
                    <SelectItem value="recommended">Recommandé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prerequisite-description">Description (optionnel)</Label>
              <Input
                id="prerequisite-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Connaissances de base en JavaScript"
              />
            </div>
            <Button onClick={handleAddPrerequisite} disabled={!selectedCourseId} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le prérequis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

