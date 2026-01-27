"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, ChevronRight, Layers } from "lucide-react"
import type { ModuleFormData } from "../formation-builder-wizard"

type StepModulesProps = {
  onSubmit: (modules: ModuleFormData[]) => void
  defaultModules?: ModuleFormData[]
  courseCreated: boolean
}

export function StepModules({ onSubmit, defaultModules = [], courseCreated }: StepModulesProps) {
  const [modules, setModules] = useState<ModuleFormData[]>(
    defaultModules.length > 0
      ? defaultModules
      : [{ id: `module-${Date.now()}`, title: "", description: "", moduleOrder: 1 }] // description conforme au DTO
  )

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: `module-${Date.now()}-${modules.length}`,
        title: "",
        description: "",
        moduleOrder: modules.length + 1,
      },
    ])
  }

  const removeModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index)
    // Réorganiser les ordres
    newModules.forEach((m, i) => {
      m.moduleOrder = i + 1
    })
    setModules(newModules)
  }

  const updateModule = (index: number, field: keyof ModuleFormData, value: any) => {
    const newModules = [...modules]
    newModules[index] = { ...newModules[index], [field]: value }
    setModules(newModules)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider que tous les modules ont un titre
    const validModules = modules.filter(m => m.title.trim())
    if (validModules.length === 0) {
      return
    }

    onSubmit(validModules)
  }

  if (!courseCreated) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Veuillez d'abord créer la formation avant d'ajouter des modules.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Modules de la formation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Organisez votre formation en modules. Chaque module contiendra des leçons.
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((module, index) => (
          <Card key={module.id || index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Module {index + 1}
                </CardTitle>
                {modules.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeModule(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`module-title-${index}`}>Titre du module *</Label>
                <Input
                  id={`module-title-${index}`}
                  name={`module-title-${index}`} // Added name attribute
                  value={module.title}
                  onChange={(e) => updateModule(index, "title", e.target.value)}
                  placeholder="Ex: Introduction à AWS"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`module-description-${index}`}>Description (optionnel)</Label>
                <Textarea
                  id={`module-description-${index}`}
                  name={`module-description-${index}`} // Added name attribute
                  value={module.description || ""}
                  onChange={(e) => updateModule(index, "description", e.target.value)}
                  placeholder="Décrivez le contenu de ce module..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addModule} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un module
      </Button>

      <div className="flex justify-end">
        <Button type="submit" disabled={modules.every(m => !m.title.trim())}>
          Continuer vers les Leçons
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  )
}
