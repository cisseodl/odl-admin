"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search"
import { Eye, CheckCircle2, XCircle, FileText, Video, Image, FileQuestion, File } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ContentItem = {
  id: number
  title: string
  type: "Vidéo" | "Document" | "Image" | "Quiz" | "Fichier"
  course: string
  instructor: string
  submittedAt: string
  status: "En attente" | "Approuvé" | "Rejeté"
  priority?: "high" | "medium" | "low"
}

export function ContentModerationQueue() {
  const [contents, setContents] = useState<ContentItem[]>([
    {
      id: 1,
      title: "Introduction à TypeScript",
      type: "Vidéo",
      course: "Formation TypeScript",
      instructor: "Marie Martin",
      submittedAt: "Il y a 2 heures",
      status: "En attente",
      priority: "high",
    },
    {
      id: 2,
      title: "Exercices pratiques React",
      type: "Document",
      course: "Formation React",
      instructor: "Jean Dupont",
      submittedAt: "Il y a 5 heures",
      status: "En attente",
      priority: "medium",
    },
    {
      id: 3,
      title: "Quiz JavaScript ES6",
      type: "Quiz",
      course: "Formation JavaScript",
      instructor: "Sophie Bernard",
      submittedAt: "Il y a 1 jour",
      status: "En attente",
      priority: "low",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<ContentItem>({
    data: contents,
    searchKeys: ["title", "course", "instructor", "type"],
  })

  const getTypeIcon = (type: ContentItem["type"]) => {
    switch (type) {
      case "Vidéo":
        return <Video className="h-4 w-4" />
      case "Document":
        return <FileText className="h-4 w-4" />
      case "Image":
        return <Image className="h-4 w-4" />
      case "Quiz":
        return <FileQuestion className="h-4 w-4" />
      case "Fichier":
        return <File className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive"
      case "medium":
        return "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] dark:bg-[hsl(var(--warning))]/30 dark:text-[hsl(var(--warning))]"
      case "low":
        return "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary"
      default:
        return ""
    }
  }

  const handleApprove = (id: number) => {
    setContents(contents.map((item) => (item.id === id ? { ...item, status: "Approuvé" as const } : item)))
  }

  const handleReject = (id: number) => {
    setContents(contents.map((item) => (item.id === id ? { ...item, status: "Rejeté" as const } : item)))
  }

  const columns: ColumnDef<ContentItem>[] = [
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {getTypeIcon(item.type)}
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {item.title}
                {item.priority && (
                  <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                    {item.priority === "high" ? "Haute" : item.priority === "medium" ? "Moyenne" : "Basse"}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{item.course}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "instructor",
      header: "Instructeur",
    },
    {
      accessorKey: "submittedAt",
      header: "Soumis le",
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original
        if (item.status !== "En attente") return null

        return (
          <ActionMenu
            actions={[
              {
                label: "Prévisualiser",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => console.log("Preview", item),
              },
              {
                label: "Approuver",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => handleApprove(item.id),
              },
              {
                label: "Rejeter",
                icon: <XCircle className="h-4 w-4" />,
                onClick: () => handleReject(item.id),
                variant: "destructive",
              },
            ]}
          />
        )
      },
    },
  ]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <SearchBar placeholder="Rechercher un contenu..." value={searchQuery} onChange={setSearchQuery} />
        </div>
        <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
      </CardContent>
    </Card>
  )
}

