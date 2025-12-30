"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid, List, Video, FileText, Image, FileQuestion, File, Play, Calendar, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ContentItemFormData } from "@/lib/validations/course-builder"

type ContentItem = ContentItemFormData & {
  courseTitle: string
  moduleTitle: string
  chapterTitle: string
  uploadDate: string
  size?: string
}

type ContentLibraryProps = {
  contents: ContentItem[]
  onContentSelect?: (content: ContentItem) => void
}

type ViewMode = "grid" | "list"

export function ContentLibrary({ contents, onContentSelect }: ContentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [hoveredContent, setHoveredContent] = useState<string | null>(null)

  const filteredAndSortedContents = useMemo(() => {
    let filtered = contents.filter((content) => {
      const matchesSearch =
        !searchQuery ||
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || content.type === filterType
      const matchesStatus = filterStatus === "all" || content.isPublished === (filterStatus === "published")
      return matchesSearch && matchesType && matchesStatus
    })

    // Trier
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        case "oldest":
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "size":
          return (parseFloat(a.size || "0") || 0) - (parseFloat(b.size || "0") || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [contents, searchQuery, filterType, filterStatus, sortBy])

  const getContentIcon = (type: ContentItemFormData["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />
      case "document":
        return <FileText className="h-5 w-5" />
      case "image":
        return <Image className="h-5 w-5" />
      case "quiz":
        return <FileQuestion className="h-5 w-5" />
      case "file":
        return <File className="h-5 w-5" />
      case "text":
        return <FileText className="h-5 w-5" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: ContentItemFormData["type"]) => {
    switch (type) {
      case "video":
        return "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary"
      case "document":
        return "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary"
      case "image":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
      case "quiz":
        return "bg-primary/25 text-primary dark:bg-primary/35 dark:text-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold leading-tight">Bibliothèque de contenus</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Parcourez et gérez tous les contenus de la plateforme avec prévisualisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contenu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="oldest">Plus ancien</SelectItem>
                  <SelectItem value="title">Titre</SelectItem>
                  <SelectItem value="size">Taille</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedContents.length} contenu{filteredAndSortedContents.length > 1 ? "s" : ""} trouvé
            {filteredAndSortedContents.length !== contents.length && ` sur ${contents.length}`}
          </div>

          {/* Vue grille */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedContents.map((content) => (
                <Card
                  key={content.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    hoveredContent === content.id && "ring-2 ring-primary"
                  )}
                  onMouseEnter={() => setHoveredContent(content.id)}
                  onMouseLeave={() => setHoveredContent(null)}
                  onClick={() => onContentSelect?.(content)}
                >
                  <CardContent className="p-0">
                    {/* Miniature/Prévisualisation */}
                    <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                      {content.type === "video" && content.url ? (
                        <>
                          <video
                            src={content.url}
                            className="w-full h-full object-cover"
                            onMouseEnter={(e) => {
                              if (hoveredContent === content.id) {
                                ;(e.target as HTMLVideoElement).play()
                              }
                            }}
                            onMouseLeave={(e) => {
                              ;(e.target as HTMLVideoElement).pause()
                            }}
                            muted
                            loop
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </>
                      ) : content.type === "image" && content.url ? (
                        <img src={content.url} alt={content.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className={cn("p-4 rounded-full", getTypeColor(content.type))}>
                            {getContentIcon(content.type)}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className={cn("text-xs", getTypeColor(content.type))}>{content.type}</Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">{content.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{content.courseTitle}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {content.duration && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {content.duration}
                          </div>
                        )}
                        {content.size && (
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {content.size}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Vue liste */}
          {viewMode === "list" && (
            <div className="space-y-2">
              {filteredAndSortedContents.map((content) => (
                <Card
                  key={content.id}
                  className={cn(
                    "cursor-pointer transition-all hover:bg-accent",
                    hoveredContent === content.id && "ring-2 ring-primary"
                  )}
                  onMouseEnter={() => setHoveredContent(content.id)}
                  onMouseLeave={() => setHoveredContent(null)}
                  onClick={() => onContentSelect?.(content)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-lg", getTypeColor(content.type))}>
                        {getContentIcon(content.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{content.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {content.courseTitle} • {content.moduleTitle} • {content.chapterTitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {content.duration && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {content.duration}
                          </div>
                        )}
                        {content.size && (
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-4 w-4" />
                            {content.size}
                          </div>
                        )}
                        <Badge variant={content.isPublished ? "default" : "secondary"} className="text-xs">
                          {content.isPublished ? "Publié" : "Brouillon"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredAndSortedContents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun contenu trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

