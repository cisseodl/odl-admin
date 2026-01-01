"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search"
import { Eye, CheckCircle2, XCircle, BookOpen, MessageSquare, AlertCircle, Edit } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  rejectionReason?: string // Added for consistency
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
  const [showEditModal, setShowEditModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false) // Renommé de showCommentDialog
  const [rejectionReason, setRejectionReason] = useState("")
  const [requestChangesComment, setRequestChangesComment] = useState("") // Pour le modal "Demander modifications"

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

  const confirmApprove = () => {
    if (selectedCourse) {
      setCourses(courses.map((item) => (item.id === selectedCourse.id ? { ...item, status: "Approuvé" as const } : item)))
      setShowApproveModal(false)
      setSelectedCourse(null)
    }
  }

  const confirmReject = () => {
    if (selectedCourse) {
      setCourses(
        courses.map((item) =>
          item.id === selectedCourse.id
            ? { ...item, status: "Rejeté" as const, rejectionReason }
            : item
        )
      )
      setShowRejectModal(false)
      setRejectionReason("")
      setSelectedCourse(null)
    }
  }

  const confirmRequestChanges = () => {
    if (selectedCourse) {
      setCourses(
        courses.map((item) =>
          item.id === selectedCourse.id ? { ...item, status: "Modifications demandées" as const } : item
        )
      )
      setShowRequestChangesModal(false)
      setRequestChangesComment("")
      setSelectedCourse(null)
    }
  }

  const handleEdit = (item: CourseItem) => {
    setSelectedCourse(item)
    setShowEditModal(true)
    // Ici, vous pourriez charger les données complètes du cours pour l'édition
  }

  const handleSaveEdit = (editedCourse: CourseItem) => {
    setCourses(
      courses.map((item) => (item.id === editedCourse.id ? { ...editedCourse, status: "En attente" as const } : item)) // Mettre à jour et remettre en attente si modifié
    )
    setShowEditModal(false)
    setSelectedCourse(null)
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
                label: "Modifier",
                icon: <Edit className="h-4 w-4" />,
                onClick: () => handleEdit(item),
              },
              {
                label: "Valider",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => { setSelectedCourse(item); setShowApproveModal(true); },
              },
              {
                label: "Demander modifications",
                icon: <MessageSquare className="h-4 w-4" />,
                onClick: () => { setSelectedCourse(item); setShowRequestChangesModal(true); },
              },
              {
                label: "Rejeter",
                icon: <XCircle className="h-4 w-4" />,
                onClick: () => { setSelectedCourse(item); setShowRejectModal(true); },
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

      {/* Modal Modifier (Edit Course) */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
            <DialogDescription>
              Ajustez les détails de la formation "{selectedCourse?.title}".
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input id="title" value={selectedCourse.title} onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructor" className="text-right">
                  Instructeur
                </Label>
                <Input id="instructor" value={selectedCourse.instructor} onChange={(e) => setSelectedCourse({ ...selectedCourse, instructor: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Catégorie
                </Label>
                <Input id="category" value={selectedCourse.category} onChange={(e) => setSelectedCourse({ ...selectedCourse, category: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modules" className="text-right">
                  Modules
                </Label>
                <Input id="modules" type="number" value={selectedCourse.modules} onChange={(e) => setSelectedCourse({ ...selectedCourse, modules: parseInt(e.target.value) || 0 })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Durée
                </Label>
                <Input id="duration" value={selectedCourse.duration} onChange={(e) => setSelectedCourse({ ...selectedCourse, duration: e.target.value })} className="col-span-3" />
              </div>
              {/* Ajoutez d'autres champs à éditer si nécessaire */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
            <Button onClick={() => selectedCourse && handleSaveEdit(selectedCourse)}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Valider (Approve Course) */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la formation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir valider la formation "{selectedCourse?.title}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Annuler</Button>
            <Button onClick={confirmApprove}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejeter (Reject Course) */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la formation</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison pour laquelle vous rejetez la formation "{selectedCourse?.title}".
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison du rejet..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Annuler</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Demander modifications (Request Changes) - Ancien showCommentDialog */}
      <Dialog open={showRequestChangesModal} onOpenChange={setShowRequestChangesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander des modifications</DialogTitle>
            <DialogDescription>
              Indiquez les modifications nécessaires pour la formation "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Décrivez les modifications à apporter..."
            value={requestChangesComment}
            onChange={(e) => setRequestChangesComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestChangesModal(false)}>
              Annuler
            </Button>
            <Button onClick={confirmRequestChanges} disabled={!requestChangesComment.trim()}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

