"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search"
import { Eye, CheckCircle2, XCircle, GraduationCap, Mail, Briefcase, Calendar, FileText, Edit } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label" // Added Label import
import { Input } from "@/components/ui/input"     // Added Input import

type InstructorRequest = {
  id: number
  name: string
  email: string
  phone?: string
  specialization: string
  experience: string
  bio?: string
  portfolio?: string
  submittedAt: string
  status: "En attente" | "Approuvé" | "Rejeté"
  priority?: "high" | "medium" | "low"
  rejectionReason?: string
}

export function InstructorModerationQueue() {
  const [requests, setRequests] = useState<InstructorRequest[]>([
    {
      id: 1,
      name: "Alexandre Moreau",
      email: "alexandre.moreau@email.com",
      phone: "+33 6 12 34 56 78",
      specialization: "Développement Web Full-Stack",
      experience: "5 ans d'expérience en développement web",
      bio: "Développeur passionné avec une expertise en React, Node.js et TypeScript. J'ai formé plus de 200 étudiants en ligne.",
      portfolio: "https://alexandre-moreau.dev",
      submittedAt: "Il y a 3 heures",
      status: "En attente",
      priority: "high",
    },
    {
      id: 2,
      name: "Camille Rousseau",
      email: "camille.rousseau@email.com",
      phone: "+33 6 98 76 54 32",
      specialization: "Data Science & Machine Learning",
      experience: "7 ans d'expérience en data science",
      bio: "Data scientist certifiée, spécialisée en Python, TensorFlow et analyse de données. Ancienne consultante pour des entreprises du CAC 40.",
      portfolio: "https://camille-rousseau-data.com",
      submittedAt: "Il y a 1 jour",
      status: "En attente",
      priority: "medium",
    },
    {
      id: 3,
      name: "Thomas Bernard",
      email: "thomas.bernard@email.com",
      specialization: "DevOps & Cloud",
      experience: "4 ans d'expérience",
      submittedAt: "Il y a 2 jours",
      status: "Approuvé",
    },
    {
      id: 4,
      name: "Julie Lefebvre",
      email: "julie.lefebvre@email.com",
      specialization: "Design UX/UI",
      experience: "3 ans d'expérience",
      submittedAt: "Il y a 5 jours",
      status: "Rejeté",
      rejectionReason: "Portfolio insuffisant et manque d'expérience pédagogique",
    },
  ])

  const [selectedRequest, setSelectedRequest] = useState<InstructorRequest | null>(null)
  const [showEditModal, setShowEditModal] = useState(false) // Nouveau modal pour l'édition
  const [showApproveModal, setShowApproveModal] = useState(false) // Nouveau modal de confirmation pour Valider
  const [showRejectModal, setShowRejectModal] = useState(false) // Modal pour le rejet (existe déjà)
  const [rejectionReason, setRejectionReason] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "En attente" | "Approuvé" | "Rejeté">("all")

  const { searchQuery, setSearchQuery, filteredData: searchFilteredData } = useSearch<InstructorRequest>({
    data: requests,
    searchKeys: ["name", "email", "specialization", "experience"],
  })

  // Filtrer par statut
  const filteredData = statusFilter === "all"
    ? searchFilteredData
    : searchFilteredData.filter(item => item.status === statusFilter)

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
    if (selectedRequest) {
      setRequests(requests.map((item) => (item.id === selectedRequest.id ? { ...item, status: "Approuvé" as const } : item)))
      setShowApproveModal(false)
      setSelectedRequest(null)
    }
  }

  const confirmReject = () => {
    if (selectedRequest) {
      setRequests(
        requests.map((item) =>
          item.id === selectedRequest.id
            ? { ...item, status: "Rejeté" as const, rejectionReason: rejectionReason || "Non spécifié" }
            : item
        )
      )
      setShowRejectModal(false)
      setRejectionReason("")
      setSelectedRequest(null)
    }
  }

  const handleEdit = (request: InstructorRequest) => {
    setSelectedRequest(request)
    setShowEditModal(true)
  }

  const handleSaveEdit = (editedRequest: InstructorRequest) => {
    setRequests(
      requests.map((item) => (item.id === editedRequest.id ? { ...editedRequest, status: "En attente" as const } : item)) // Remettre en attente si modifié
    )
    setShowEditModal(false)
    setSelectedRequest(null)
  }

  const columns: ColumnDef<InstructorRequest>[] = [
    {
      accessorKey: "name",
      header: "Candidat",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{item.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium flex items-center gap-2">
                {item.name}
                {item.priority && (
                  <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                    {item.priority === "high" ? "Haute" : item.priority === "medium" ? "Moyenne" : "Basse"}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="h-3.5 w-3.5" />
                {item.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "specialization",
      header: "Spécialisation",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          {row.original.specialization}
        </div>
      ),
    },
    {
      accessorKey: "experience",
      header: "Expérience",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.experience}</span>
        </div>
      ),
    },
    {
      accessorKey: "submittedAt",
      header: "Soumis le",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {row.original.submittedAt}
        </div>
      ),
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
        // Si l'élément n'est pas "En attente", on propose seulement de le modifier pour le cas où il faut réajuster
        if (item.status !== "En attente") {
          return (
            <ActionMenu
              actions={[
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => handleEdit(item),
                },
              ]}
            />
          )
        }

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
                onClick: () => { setSelectedRequest(item); setShowApproveModal(true); },
              },
              {
                label: "Rejeter",
                icon: <XCircle className="h-4 w-4" />,
                onClick: () => {
                  setSelectedRequest(item)
                  setShowRejectModal(true)
                },
                variant: "destructive",
              },
            ]}
          />
        )
      },
    },
  ]

  const pendingCount = requests.filter((r) => r.status === "En attente").length
  const approvedCount = requests.filter((r) => r.status === "Approuvé").length
  const rejectedCount = requests.filter((r) => r.status === "Rejeté").length

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 space-y-4">
            <SearchBar
              placeholder="Rechercher un candidat..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <TabsList>
                <TabsTrigger value="all">Tous ({requests.length})</TabsTrigger>
                <TabsTrigger value="En attente">
                  En attente {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="Approuvé">Approuvés ({approvedCount})</TabsTrigger>
                <TabsTrigger value="Rejeté">Rejetés ({rejectedCount})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
        </CardContent>
      </Card>

      {/* Modal Modifier (Edit Instructor Request) */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la demande d'instructeur</DialogTitle>
            <DialogDescription>
              Ajustez les détails de la demande de "{selectedRequest?.name}".
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input id="name" value={selectedRequest.name} onChange={(e) => setSelectedRequest({ ...selectedRequest, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" value={selectedRequest.email} onChange={(e) => setSelectedRequest({ ...selectedRequest, email: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Téléphone</Label>
                <Input id="phone" value={selectedRequest.phone || ''} onChange={(e) => setSelectedRequest({ ...selectedRequest, phone: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialization" className="text-right">Spécialisation</Label>
                <Input id="specialization" value={selectedRequest.specialization} onChange={(e) => setSelectedRequest({ ...selectedRequest, specialization: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experience" className="text-right">Expérience</Label>
                <Input id="experience" value={selectedRequest.experience} onChange={(e) => setSelectedRequest({ ...selectedRequest, experience: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="bio" className="text-right mt-2">Biographie</Label>
                <Textarea id="bio" value={selectedRequest.bio || ''} onChange={(e) => setSelectedRequest({ ...selectedRequest, bio: e.target.value })} className="col-span-3 min-h-[100px]" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portfolio" className="text-right">Portfolio</Label>
                <Input id="portfolio" value={selectedRequest.portfolio || ''} onChange={(e) => setSelectedRequest({ ...selectedRequest, portfolio: e.target.value })} className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
            <Button onClick={() => selectedRequest && handleSaveEdit(selectedRequest)}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Valider (Approve Instructor Request) */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la demande d'instructeur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir valider la demande de "{selectedRequest?.name}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Annuler</Button>
            <Button onClick={confirmApprove}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejeter (Reject Instructor Request) - Utilise le modal showRejectDialog existant */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Indiquez la raison du rejet de la demande de {selectedRequest?.name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Décrivez la raison du rejet..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false)
              setRejectionReason("")
            }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}