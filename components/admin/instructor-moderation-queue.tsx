"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search"
import { Eye, CheckCircle2, XCircle, GraduationCap, Mail, Briefcase, Calendar, FileText } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
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

  const handleApprove = (id: number) => {
    setRequests(requests.map((item) => (item.id === id ? { ...item, status: "Approuvé" as const } : item)))
  }

  const handleReject = () => {
    if (selectedRequest) {
      setRequests(
        requests.map((item) =>
          item.id === selectedRequest.id
            ? { ...item, status: "Rejeté" as const, rejectionReason: rejectionReason || "Non spécifié" }
            : item
        )
      )
      setShowRejectDialog(false)
      setRejectionReason("")
      setSelectedRequest(null)
    }
  }

  const handleView = (request: InstructorRequest) => {
    setSelectedRequest(request)
    setShowViewDialog(true)
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
        if (item.status !== "En attente") {
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => handleView(item),
                },
              ]}
            />
          )
        }

        return (
          <ActionMenu
            actions={[
              {
                label: "Voir détails",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => handleView(item),
              },
              {
                label: "Approuver",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => handleApprove(item.id),
              },
              {
                label: "Rejeter",
                icon: <XCircle className="h-4 w-4" />,
                onClick: () => {
                  setSelectedRequest(item)
                  setShowRejectDialog(true)
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

      {/* Dialog de visualisation */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-tight flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {selectedRequest?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {selectedRequest?.name}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Détails de la demande d'inscription
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={selectedRequest.status} />
                {selectedRequest.priority && (
                  <Badge className={`text-xs ${getPriorityColor(selectedRequest.priority)}`}>
                    Priorité {selectedRequest.priority === "high" ? "Haute" : selectedRequest.priority === "medium" ? "Moyenne" : "Basse"}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">Email</p>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                </div>
                {selectedRequest.phone && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground leading-relaxed">Téléphone</p>
                      <p className="font-medium">{selectedRequest.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">Spécialisation</p>
                    <p className="font-medium">{selectedRequest.specialization}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">Date de soumission</p>
                    <p className="font-medium">{selectedRequest.submittedAt}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Expérience</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedRequest.experience}</p>
                </div>
                {selectedRequest.bio && (
                  <div>
                    <p className="text-sm font-medium mb-2">Biographie</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedRequest.bio}</p>
                  </div>
                )}
                {selectedRequest.portfolio && (
                  <div>
                    <p className="text-sm font-medium mb-2">Portfolio</p>
                    <a
                      href={selectedRequest.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      {selectedRequest.portfolio}
                    </a>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-destructive">Raison du rejet</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>

              {selectedRequest.status === "En attente" && (
                <>
                  <Separator />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                      Fermer
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowViewDialog(false)
                        setShowRejectDialog(true)
                      }}
                    >
                      Rejeter
                    </Button>
                    <Button onClick={() => {
                      handleApprove(selectedRequest.id)
                      setShowViewDialog(false)
                    }}>
                      Approuver
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
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
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

