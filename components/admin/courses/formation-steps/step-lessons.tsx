"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, ChevronRight, FileText, Upload, Video, File, HelpCircle, FlaskConical } from "lucide-react"
import type { LessonFormData, ModuleFormData } from "../formation-builder-wizard"

type StepLessonsProps = {
  onSubmit: (lessons: LessonFormData[]) => void
  modules: ModuleFormData[]
  defaultLessons?: LessonFormData[]
}

export function StepLessons({ onSubmit, modules, defaultLessons = [] }: StepLessonsProps) {
  const [lessons, setLessons] = useState<LessonFormData[]>(
    defaultLessons.length > 0
      ? defaultLessons
      : modules.length > 0
        ? [
            {
              id: `lesson-${Date.now()}`,
              moduleId: modules[0].id || "",
              title: "",
              lessonOrder: 1,
              type: "VIDEO",
              duration: 0,
            },
          ]
        : []
  )

  const addLesson = (moduleId: string) => {
    const moduleLessons = lessons.filter((l) => l.moduleId === moduleId)
    const maxOrder = moduleLessons.length > 0
      ? Math.max(...moduleLessons.map((l) => l.lessonOrder))
      : 0

    setLessons([
      ...lessons,
      {
        id: `lesson-${Date.now()}-${lessons.length}`,
        moduleId,
        title: "",
        lessonOrder: maxOrder + 1,
        type: "VIDEO",
        duration: 0,
        contentUrl: undefined,
        file: undefined,
      },
    ])
  }

  const removeLesson = (lessonId: string) => {
    setLessons(lessons.filter((l) => l.id !== lessonId))
  }

  const updateLesson = (lessonId: string, field: keyof LessonFormData, value: any) => {
    setLessons(
      lessons.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider que toutes les leçons ont un titre et sont associées à un module
    const validLessons = lessons.filter(
      (l) => l.title.trim() && l.moduleId && modules.some((m) => m.id === l.moduleId)
    )
    
    onSubmit(validLessons)
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Veuillez d'abord créer au moins un module avant d'ajouter des leçons.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Leçons de la formation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ajoutez des leçons à chaque module. Les leçons peuvent être des vidéos, des documents, des quiz ou des labs.
        </p>
      </div>

      {modules.map((module) => {
        const moduleLessons = lessons.filter((l) => l.moduleId === module.id)
        
        return (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription>
                    {moduleLessons.length} leçon{moduleLessons.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLesson(module.id || "")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une leçon
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {moduleLessons.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune leçon pour ce module. Cliquez sur "Ajouter une leçon" pour commencer.
                </div>
              ) : (
                moduleLessons.map((lesson, index) => (
                  <Card key={lesson.id} className="bg-muted/50">
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Leçon {index + 1}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLesson(lesson.id || "")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`lesson-title-${lesson.id}`}>Titre de la leçon *</Label>
                        <Input
                          id={`lesson-title-${lesson.id}`}
                          value={lesson.title}
                          onChange={(e) => updateLesson(lesson.id || "", "title", e.target.value)}
                          placeholder="Ex: Introduction à EC2"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`lesson-type-${lesson.id}`}>Type *</Label>
                        <Select
                          value={lesson.type}
                          onValueChange={(value: any) => {
                            updateLesson(lesson.id || "", "type", value)
                            // Réinitialiser le fichier si le type change
                            updateLesson(lesson.id || "", "file", undefined)
                            updateLesson(lesson.id || "", "contentUrl", undefined)
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIDEO">
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                Vidéo
                              </div>
                            </SelectItem>
                            <SelectItem value="DOCUMENT">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4" />
                                Document
                              </div>
                            </SelectItem>
                            <SelectItem value="QUIZ">
                              <div className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                Quiz
                              </div>
                            </SelectItem>
                            <SelectItem value="LAB">
                              <div className="flex items-center gap-2">
                                <FlaskConical className="h-4 w-4" />
                                Lab
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`lesson-file-${lesson.id}`}>
                          {lesson.type === "VIDEO" && "Fichier vidéo *"}
                          {lesson.type === "DOCUMENT" && "Fichier document (PDF, etc.) *"}
                          {lesson.type === "LAB" && "Fichier lab *"}
                          {lesson.type === "QUIZ" && "URL du quiz (optionnel)"}
                        </Label>
                        {lesson.type === "QUIZ" ? (
                          <Input
                            id={`lesson-file-${lesson.id}`}
                            type="url"
                            value={lesson.contentUrl || ""}
                            onChange={(e) =>
                              updateLesson(lesson.id || "", "contentUrl", e.target.value)
                            }
                            placeholder="https://..."
                          />
                        ) : (
                          <div className="space-y-2">
                            <Input
                              id={`lesson-file-${lesson.id}`}
                              type="file"
                              accept={
                                lesson.type === "VIDEO"
                                  ? "video/*"
                                  : lesson.type === "DOCUMENT"
                                  ? ".pdf,.doc,.docx"
                                  : "*"
                              }
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  updateLesson(lesson.id || "", "file", file)
                                }
                              }}
                              className="cursor-pointer"
                            />
                            {lesson.file && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span className="truncate">{lesson.file.name}</span>
                                <span className="text-xs">
                                  ({(lesson.file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      </div>

                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end">
        <Button type="submit">
          Continuer vers les Quiz
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  )
}
