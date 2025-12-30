"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search"
import { Eye, CheckCircle2, XCircle, BookOpen, MessageSquare, AlertCircle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type CourseItem = {
  id: number
  title: string
  instructor: string
  category: string
  submittedAt: string
  status: "En attente" | "Approuvé" | "Rejeté" | "Modifications demandées"
  priority?: "high" | "medium" | "low"
  modules: number
  duration: string
}

export function CourseModerationQueue() {
  const [courses, setCourses] = useState<CourseItem[]>([
    {
      id: 1,
      title: "Formation React Avancé - Nouvelle version",
      instructor: "Jean Dupont",
      category: "Développement Web",
      submittedAt: "Il y a 2 heures",
      status: "En attente",
      priority: "high",
      modules: 12,
      duration: "8h 30min",
    },
    {
      id: 2,
      title: "Introduction à Python pour Data Science",
      instructor: "Marie Martin",
      category: "Data Science",
      submittedAt: "Il y a 1 jour",
      status: "En attente",
      priority: "medium",
      modules: 8,
      duration: "6h 15min",
    },
  ])

  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [comment, setComment] = useState("")

  const { searchQuery, setSearchQuery, filteredData } = useSearch<CourseItem>({
    data: courses,
    searchKeys: ["title", "instructor", "category"],
  })

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
    setCourses(courses.map((item) => (item.id === id ? { ...item, status: "Approuvé" as const } : item)))
  }

  const handleReject = (id: number) => {
    setCourses(courses.map((item) => (item.id === id ? { ...item, status: "Rejeté" as const } : item)))
  }

  const handleRequestChanges = () => {
    if (selectedCourse) {
      setCourses(
        courses.map((item) =>
          item.id === selectedCourse.id ? { ...item, status: "Modifications demandées" as const } : item
        )
      )
      setShowCommentDialog(false)
      setComment("")
      setSelectedCourse(null)
    }
  }

  const columns: ColumnDef<CourseItem>[] = [
    {
      accessorKey: "title",
      header: "Formation",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-4 w-4" />
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
              <div className="text-sm text-muted-foreground">{item.category}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "instructor",
      header: "Instructeur",
    },
    {
      accessorKey: "modules",
      header: "Modules",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          {row.original.modules}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Durée",
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
                label: "Vérifier",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => console.log("Review", item),
              },
              {
                label: "Approuver",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => handleApprove(item.id),
              },
              {
                label: "Demander modifications",
                icon: <MessageSquare className="h-4 w-4" />,
                onClick: () => {
                  setSelectedCourse(item)
                  setShowCommentDialog(true)
                },
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
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <SearchBar placeholder="Rechercher une formation..." value={searchQuery} onChange={setSearchQuery} />
          </div>
          <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
        </CardContent>
      </Card>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander des modifications</DialogTitle>
            <DialogDescription>
              Indiquez les modifications nécessaires pour la formation "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Décrivez les modifications à apporter..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRequestChanges} disabled={!comment.trim()}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

