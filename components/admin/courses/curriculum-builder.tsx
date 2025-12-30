"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, GripVertical, Trash2, Edit, ChevronDown, ChevronUp, BookOpen, FileText, Clock } from "lucide-react"
import type { CourseStructureFormData, ModuleFormData, ChapterFormData } from "@/lib/validations/course-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type CurriculumBuilderProps = {
  structure: CourseStructureFormData
  onStructureChange: (structure: CourseStructureFormData) => void
}

export function CurriculumBuilder({ structure, onStructureChange }: CurriculumBuilderProps) {
  const [editingModule, setEditingModule] = useState<string | null>(null)
  const [editingChapter, setEditingChapter] = useState<{ moduleId: string; chapterId: string } | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(structure.modules.map((m) => m.id)))
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" })
  const [chapterForm, setChapterForm] = useState({ title: "", description: "" })

  const addModule = () => {
    const newModule: ModuleFormData = {
      id: `module-${Date.now()}`,
      title: "Nouveau module",
      description: "",
      chapters: [],
      order: structure.modules.length,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const newModules = [...structure.modules, newModule]
    updateStructure({ ...structure, modules: newModules })
    setEditingModule(newModule.id)
    setModuleForm({ title: "Nouveau module", description: "" })
  }

  const updateModule = (moduleId: string, updates: Partial<ModuleFormData>) => {
    const newModules = structure.modules.map((m) =>
      m.id === moduleId ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    )
    updateStructure({ ...structure, modules: newModules })
  }

  const deleteModule = (moduleId: string) => {
    const newModules = structure.modules.filter((m) => m.id !== moduleId).map((m, index) => ({
      ...m,
      order: index,
    }))
    updateStructure({ ...structure, modules: newModules })
  }

  const addChapter = (moduleId: string) => {
    const module = structure.modules.find((m) => m.id === moduleId)
    if (!module) return

    const newChapter: ChapterFormData = {
      id: `chapter-${Date.now()}`,
      title: "Nouveau chapitre",
      description: "",
      contentItems: [],
      order: module.chapters.length,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newModules = structure.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            chapters: [...m.chapters, newChapter],
            updatedAt: new Date().toISOString(),
          }
        : m
    )

    updateStructure({ ...structure, modules: newModules })
    setEditingChapter({ moduleId, chapterId: newChapter.id })
    setChapterForm({ title: "Nouveau chapitre", description: "" })
  }

  const updateChapter = (moduleId: string, chapterId: string, updates: Partial<ChapterFormData>) => {
    const newModules = structure.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            chapters: m.chapters.map((c) =>
              c.id === chapterId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
            ),
            updatedAt: new Date().toISOString(),
          }
        : m
    )
    updateStructure({ ...structure, modules: newModules })
  }

  const deleteChapter = (moduleId: string, chapterId: string) => {
    const newModules = structure.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            chapters: m.chapters.filter((c) => c.id !== chapterId).map((c, index) => ({
              ...c,
              order: index,
            })),
            updatedAt: new Date().toISOString(),
          }
        : m
    )
    updateStructure({ ...structure, modules: newModules })
  }

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const updateStructure = (newStructure: CourseStructureFormData) => {
    // Calculer les totaux
    const totalChapters = newStructure.modules.reduce((sum, m) => sum + m.chapters.length, 0)
    const totalContentItems = newStructure.modules.reduce(
      (sum, m) => sum + m.chapters.reduce((s, c) => s + c.contentItems.length, 0),
      0
    )

    // Calculer la durée totale (simplifié - nécessiterait le calcul réel des durées)
    const totalDuration = `${newStructure.modules.length}h ${totalChapters}min`

    onStructureChange({
      ...newStructure,
      totalChapters,
      totalContentItems,
      totalDuration,
      updatedAt: new Date().toISOString(),
    })
  }

  const saveModuleEdit = () => {
    if (editingModule && moduleForm.title.trim()) {
      updateModule(editingModule, {
        title: moduleForm.title,
        description: moduleForm.description,
      })
      setEditingModule(null)
      setModuleForm({ title: "", description: "" })
    }
  }

  const saveChapterEdit = () => {
    if (editingChapter && chapterForm.title.trim()) {
      updateChapter(editingChapter.moduleId, editingChapter.chapterId, {
        title: chapterForm.title,
        description: chapterForm.description,
      })
      setEditingChapter(null)
      setChapterForm({ title: "", description: "" })
    }
  }

  return (
    <div className="space-y-4">
      {structure.modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules.has(module.id)
        const isEditing = editingModule === module.id

        return (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-grab active:cursor-grabbing"
                    aria-label="Réorganiser le module"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={moduleForm.title}
                          onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                          placeholder="Titre du module"
                          className="font-semibold"
                          autoFocus
                        />
                        <Textarea
                          value={moduleForm.description}
                          onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                          placeholder="Description du module (optionnel)"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={saveModuleEdit}>
                            Enregistrer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingModule(null)
                              setModuleForm({ title: "", description: "" })
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{module.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {module.chapters.length} chapitre{module.chapters.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {module.description && (
                          <CardDescription className="mt-1">{module.description}</CardDescription>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleModuleExpansion(module.id)}
                    aria-label={isExpanded ? "Réduire" : "Développer"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {!isEditing && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingModule(module.id)
                          setModuleForm({ title: module.title, description: module.description || "" })
                        }}
                        aria-label="Modifier le module"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteModule(module.id)}
                        aria-label="Supprimer le module"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {module.chapters.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">Aucun chapitre dans ce module</p>
                      <Button size="sm" variant="outline" onClick={() => addChapter(module.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un chapitre
                      </Button>
                    </div>
                  ) : (
                    module.chapters.map((chapter, chapterIndex) => {
                      const isEditingChapter =
                        editingChapter?.moduleId === module.id && editingChapter?.chapterId === chapter.id

                      return (
                        <div
                          key={chapter.id}
                          className="border rounded-lg p-4 bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 cursor-grab active:cursor-grabbing"
                                aria-label="Réorganiser le chapitre"
                              >
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <div className="flex-1">
                                {isEditingChapter ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={chapterForm.title}
                                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                                      placeholder="Titre du chapitre"
                                      className="font-medium"
                                      autoFocus
                                    />
                                    <Textarea
                                      value={chapterForm.description}
                                      onChange={(e) =>
                                        setChapterForm({ ...chapterForm, description: e.target.value })
                                      }
                                      placeholder="Description du chapitre (optionnel)"
                                      rows={2}
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" onClick={saveChapterEdit}>
                                        Enregistrer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingChapter(null)
                                          setChapterForm({ title: "", description: "" })
                                        }}
                                      >
                                        Annuler
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{chapter.title}</h4>
                                      <Badge variant="secondary" className="text-xs">
                                        {chapter.contentItems.length} contenu{chapter.contentItems.length > 1 ? "s" : ""}
                                      </Badge>
                                    </div>
                                    {chapter.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
                                    )}
                                    {chapter.duration && (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {chapter.duration}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {!isEditingChapter && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setEditingChapter({ moduleId: module.id, chapterId: chapter.id })
                                    setChapterForm({ title: chapter.title, description: chapter.description || "" })
                                  }}
                                  aria-label="Modifier le chapitre"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => deleteChapter(module.id, chapter.id)}
                                  aria-label="Supprimer le chapitre"
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => addChapter(module.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un chapitre
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      <Button variant="outline" className="w-full" onClick={addModule}>
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un module
      </Button>

      {/* Statistiques */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{structure.modules.length}</p>
              <p className="text-xs text-muted-foreground">Modules</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{structure.totalChapters}</p>
              <p className="text-xs text-muted-foreground">Chapitres</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{structure.totalDuration}</p>
              <p className="text-xs text-muted-foreground">Durée totale</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

