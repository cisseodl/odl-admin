"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, ChevronDown, FileText, Video, Image, FileQuestion, File, BookOpen, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CourseStructureFormData, ModuleFormData, ChapterFormData, ContentItemFormData } from "@/lib/validations/course-builder"

type ContentOrganizerProps = {
  courses: Array<{
    id: number
    title: string
    structure?: CourseStructureFormData
  }>
  onContentSelect?: (content: { courseId: number; moduleId: string; chapterId: string; contentId: string }) => void
}

export function ContentOrganizer({ courses, onContentSelect }: ContentOrganizerProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const structure = selectedCourse?.structure

  const toggleModule = (moduleId: string) => {
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

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  const getContentIcon = (type: ContentItemFormData["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "image":
        return <Image className="h-4 w-4" />
      case "quiz":
        return <FileQuestion className="h-4 w-4" />
      case "file":
        return <File className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const filterContent = (content: ContentItemFormData) => {
    if (filterType !== "all" && content.type !== filterType) return false
    if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }

  const getStats = () => {
    if (!structure) return { modules: 0, chapters: 0, contents: 0 }
    const modules = structure.modules.length
    const chapters = structure.modules.reduce((sum, m) => sum + m.chapters.length, 0)
    const contents = structure.modules.reduce(
      (sum, m) => sum + m.chapters.reduce((s, c) => s + c.contentItems.length, 0),
      0
    )
    return { modules, chapters, contents }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold leading-tight">Organisation du contenu</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Vue hiérarchique de tous les contenus organisés par cours, modules et chapitres
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélection du cours */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sélectionner un cours</label>
            <Select
              value={selectedCourseId?.toString() || ""}
              onValueChange={(value) => {
                setSelectedCourseId(Number(value))
                setExpandedModules(new Set())
                setExpandedChapters(new Set())
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un cours" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statistiques */}
          {selectedCourse && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.modules}</p>
                <p className="text-xs text-muted-foreground">Modules</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.chapters}</p>
                <p className="text-xs text-muted-foreground">Chapitres</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.contents}</p>
                <p className="text-xs text-muted-foreground">Contenus</p>
              </div>
            </div>
          )}

          {/* Filtres et recherche */}
          {selectedCourse && structure && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher un contenu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="video">Vidéos</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="file">Fichiers</SelectItem>
                    <SelectItem value="text">Textes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Arbre hiérarchique */}
              <div className="border rounded-lg p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {structure.modules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun module dans ce cours</p>
                  </div>
                ) : (
                  structure.modules.map((module) => {
                    const isModuleExpanded = expandedModules.has(module.id)
                    const filteredChapters = module.chapters.filter((chapter) =>
                      chapter.contentItems.some(filterContent)
                    )

                    return (
                      <div key={module.id} className="space-y-1">
                        {/* Module */}
                        <div
                          className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                          onClick={() => toggleModule(module.id)}
                        >
                          {isModuleExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          {isModuleExpanded ? (
                            <FolderOpen className="h-4 w-4 text-primary" />
                          ) : (
                            <Folder className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium flex-1">{module.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {module.chapters.length} chapitre{module.chapters.length > 1 ? "s" : ""}
                          </Badge>
                        </div>

                        {/* Chapitres */}
                        {isModuleExpanded && (
                          <div className="ml-6 space-y-1">
                            {module.chapters.length === 0 ? (
                              <div className="text-sm text-muted-foreground pl-6 py-2">
                                Aucun chapitre
                              </div>
                            ) : (
                              module.chapters.map((chapter) => {
                                const isChapterExpanded = expandedChapters.has(chapter.id)
                                const filteredContents = chapter.contentItems.filter(filterContent)

                                if (filterType !== "all" || searchQuery) {
                                  if (filteredContents.length === 0) return null
                                }

                                return (
                                  <div key={chapter.id} className="space-y-1">
                                    {/* Chapitre */}
                                    <div
                                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                                      onClick={() => toggleChapter(chapter.id)}
                                    >
                                      {isChapterExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm flex-1">{chapter.title}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {chapter.contentItems.length} contenu
                                        {chapter.contentItems.length > 1 ? "s" : ""}
                                      </Badge>
                                    </div>

                                    {/* Contenus */}
                                    {isChapterExpanded && (
                                      <div className="ml-6 space-y-1">
                                        {chapter.contentItems.length === 0 ? (
                                          <div className="text-xs text-muted-foreground pl-6 py-1">
                                            Aucun contenu
                                          </div>
                                        ) : (
                                          chapter.contentItems
                                            .filter(filterContent)
                                            .map((content) => (
                                              <div
                                                key={content.id}
                                                className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm"
                                                onClick={() =>
                                                  onContentSelect?.({
                                                    courseId: selectedCourseId!,
                                                    moduleId: module.id,
                                                    chapterId: chapter.id,
                                                    contentId: content.id,
                                                  })
                                                }
                                              >
                                                <div className="text-muted-foreground">
                                                  {getContentIcon(content.type)}
                                                </div>
                                                <span className="flex-1">{content.title}</span>
                                                <Badge variant="outline" className="text-xs">
                                                  {content.type}
                                                </Badge>
                                                {content.duration && (
                                                  <span className="text-xs text-muted-foreground">
                                                    {content.duration}
                                                  </span>
                                                )}
                                              </div>
                                            ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}

          {!selectedCourse && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez un cours pour voir son organisation</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

