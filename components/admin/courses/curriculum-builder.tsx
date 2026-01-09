"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, GripVertical, Trash2, Edit, ChevronDown, ChevronUp, BookOpen, FileText, Clock, Video, FileQuestion } from "lucide-react"
import type { CourseStructureFormData, ModuleFormData, LessonFormData } from "@/lib/validations/course-builder"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CurriculumBuilderProps = {
  structure: CourseStructureFormData
  onStructureChange: (structure: CourseStructureFormData) => void
}

export function CurriculumBuilder({ structure, onStructureChange }: CurriculumBuilderProps) {
  const [editingModule, setEditingModule] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lessonId: string } | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(structure.modules.map((m) => m.id)))
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" })
  const [lessonForm, setLessonForm] = useState<Partial<LessonFormData>>({ title: "", description: "", type: "TEXT", duration: 0, contentUrl: "" })

  const addModule = () => {
    const newModule: ModuleFormData = {
      id: `module-${Date.now()}`,
      title: "Nouveau module",
      description: "",
      lessons: [],
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

  const addLesson = (moduleId: string) => {
    const module = structure.modules.find((m) => m.id === moduleId)
    if (!module) return

    const newLesson: LessonFormData = {
      id: `lesson-${Date.now()}`,
      title: "Nouvelle leçon",
      description: "",
      order: module.lessons.length,
      type: "TEXT",
      contentUrl: "",
      duration: 0,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newModules = structure.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: [...m.lessons, newLesson],
            updatedAt: new Date().toISOString(),
          }
        : m
    )

    updateStructure({ ...structure, modules: newModules })
    setEditingLesson({ moduleId, lessonId: newLesson.id })
    setLessonForm({ title: "Nouvelle leçon", description: "", type: "TEXT", duration: 0, contentUrl: "" })
  }

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<LessonFormData>) => {
    const newModules = structure.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
            ),
            updatedAt: new Date().toISOString(),
          }
        : m
    )
    updateStructure({ ...structure, modules: newModules })
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const newModules = structure.modules.map((m) =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lessonId).map((l, index) => ({
              ...l,
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
    const totalLessons = newStructure.modules.reduce((sum, m) => sum + m.lessons.length, 0)
    const totalDurationMinutes = newStructure.modules.reduce(
        (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.duration || 0), 0), 0
    )
    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = totalDurationMinutes % 60;
    const totalDuration = `${hours}h ${minutes}min`

    onStructureChange({
      ...newStructure,
      totalLessons,
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

  const saveLessonEdit = () => {
    if (editingLesson && lessonForm.title?.trim()) {
      updateLesson(editingLesson.moduleId, editingLesson.lessonId, lessonForm)
      setEditingLesson(null)
      setLessonForm({ title: "", description: "", type: "TEXT", duration: 0, contentUrl: "" })
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
                            {module.lessons.length} leçon{module.lessons.length > 1 ? "s" : ""}
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
                  {module.lessons.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">Aucune leçon dans ce module</p>
                      <Button size="sm" variant="outline" onClick={() => addLesson(module.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une leçon
                      </Button>
                    </div>
                  ) : (
                    module.lessons.map((lesson, lessonIndex) => {
                      const isEditingLesson =
                        editingLesson?.moduleId === module.id && editingLesson?.lessonId === lesson.id

                      return (
                        <div
                          key={lesson.id}
                          className="border rounded-lg p-4 bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 cursor-grab active:cursor-grabbing"
                                aria-label="Réorganiser la leçon"
                              >
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <div className="flex-1">
                                {isEditingLesson ? (
                                  <div className="space-y-3">
                                    <Input
                                      value={lessonForm.title}
                                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                      placeholder="Titre de la leçon"
                                      className="font-medium"
                                      autoFocus
                                    />
                                    <Textarea
                                      value={lessonForm.description}
                                      onChange={(e) =>
                                        setLessonForm({ ...lessonForm, description: e.target.value })
                                      }
                                      placeholder="Description de la leçon (optionnel)"
                                      rows={2}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Type de contenu</Label>
                                        <Select value={lessonForm.type} onValueChange={(value) => setLessonForm({...lessonForm, type: value as "VIDEO" | "QUIZ" | "TEXT"})}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="TEXT">Texte</SelectItem>
                                            <SelectItem value="VIDEO">Vidéo</SelectItem>
                                            <SelectItem value="QUIZ">Quiz</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Durée (minutes)</Label>
                                        <Input
                                          type="number"
                                          value={lessonForm.duration}
                                          onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                                        />
                                      </div>
                                    </div>
                                    {lessonForm.type === 'VIDEO' && (
                                       <div>
                                         <Label>URL de la vidéo</Label>
                                         <Input
                                           value={lessonForm.contentUrl}
                                           onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                                           placeholder="https://example.com/video.mp4"
                                         />
                                       </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" onClick={saveLessonEdit}>
                                        Enregistrer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingLesson(null)
                                          setLessonForm({ title: "", description: "", type: "TEXT", duration: 0, contentUrl: "" })
                                        }}
                                      >
                                        Annuler
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      {lesson.type === 'VIDEO' && <Video className="h-4 w-4 text-muted-foreground"/>}
                                      {lesson.type === 'QUIZ' && <FileQuestion className="h-4 w-4 text-muted-foreground"/>}
                                      {lesson.type === 'TEXT' && <FileText className="h-4 w-4 text-muted-foreground"/>}
                                      <h4 className="font-medium">{lesson.title}</h4>
                                      <Badge variant="secondary" className="text-xs">{lesson.type}</Badge>
                                    </div>
                                    {lesson.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                                    )}
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {lesson.duration || 0} minutes
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            {!isEditingLesson && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setEditingLesson({ moduleId: module.id, lessonId: lesson.id })
                                    setLessonForm(lesson)
                                  }}
                                  aria-label="Modifier la leçon"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => deleteLesson(module.id, lesson.id)}
                                  aria-label="Supprimer la leçon"
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
                    onClick={() => addLesson(module.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une leçon
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
              <p className="text-2xl font-bold">{structure.totalLessons}</p>
              <p className="text-xs text-muted-foreground">Leçons</p>
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

