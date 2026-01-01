"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search"
import { Eye, CheckCircle2, XCircle, FileText, Video, Image, FileQuestion, File, Edit } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type ContentItem = {
  id: number
  title: string
  type: "Vidéo" | "Document" | "Image" | "Quiz" | "Fichier"
  course: string
  instructor: string
  submittedAt: string
  status: "En attente" | "Approuvé" | "Rejeté"
  priority?: "high" | "medium" | "low"
  // Ajout d'une propriété pour la raison du rejet si applicable
  rejectionReason?: string
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

  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

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

  const confirmApprove = () => {
    if (selectedContent) {
      setContents(contents.map((item) => (item.id === selectedContent.id ? { ...item, status: "Approuvé" as const } : item)))
      setShowApproveModal(false)
      setSelectedContent(null)
    }
  }

  const confirmReject = () => {
    if (selectedContent) {
      setContents(contents.map((item) => (item.id === selectedContent.id ? { ...item, status: "Rejeté" as const, rejectionReason } : item)))
      setShowRejectModal(false)
      setRejectionReason("")
      setSelectedContent(null)
    }
  }

  const handleEdit = (item: ContentItem) => {
    setSelectedContent(item)
    setShowEditModal(true)
    // Ici, vous pourriez charger les données complètes du contenu pour l'édition
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
                label: "Modifier",
                icon: <Edit className="h-4 w-4" />,
                onClick: () => handleEdit(item),
              },
              {
                label: "Valider",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => { setSelectedContent(item); setShowApproveModal(true); },
              },
              {
                label: "Rejeter",
                icon: <XCircle className="h-4 w-4" />,
                onClick: () => { setSelectedContent(item); setShowRejectModal(true); },
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

      {/* Modal Modifier */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le contenu</DialogTitle>
            <DialogDescription>
              Aperçu et édition du contenu "{selectedContent?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titre
              </Label>
              <Input id="title" defaultValue={selectedContent?.title} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Input id="type" defaultValue={selectedContent?.type} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">
                Cours
              </Label>
              <Input id="course" defaultValue={selectedContent?.course} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructor" className="text-right">
                Instructeur
              </Label>
              <Input id="instructor" defaultValue={selectedContent?.instructor} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
            <Button type="submit" onClick={() => { /* Logique de sauvegarde */ setShowEditModal(false); }}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Valider */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le contenu</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir valider le contenu "{selectedContent?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Annuler</Button>
            <Button onClick={confirmApprove}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejeter */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le contenu</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison pour laquelle vous rejetez le contenu "{selectedContent?.title}".
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
    </Card>
  )
}