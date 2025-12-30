"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal, Check, X, Star, Trash2, Eye, MessageSquare, BookOpen, Calendar } from "lucide-react"
import { EmptyState } from "./empty-state"
import { ViewReviewModal } from "./modals/view-review-modal"
import { ApproveReviewModal } from "./modals/approve-review-modal"

type Review = {
  id: number
  user: string
  course: string
  rating: number
  comment: string
  date: string
  status: "Approuvé" | "En attente" | "Rejeté"
  avatar?: string
}

export function ReviewsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [approveAction, setApproveAction] = useState<"approve" | "reject">("approve")
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      user: "Marie Dupont",
      course: "Formation React Avancé",
      rating: 5,
      comment: "Excellente formation, très complète et bien structurée. Je recommande vivement !",
      date: "15 Jan 2024",
      status: "Approuvé",
      avatar: "/diverse-woman-portrait.png",
    },
    {
      id: 2,
      user: "Jean Martin",
      course: "Formation Full Stack",
      rating: 4,
      comment: "Très bon contenu, mais certains chapitres pourraient être plus détaillés.",
      date: "12 Jan 2024",
      status: "Approuvé",
    },
    {
      id: 3,
      user: "Sophie Bernard",
      course: "Formation Design UI/UX",
      rating: 5,
      comment: "Parfait ! Les exemples pratiques sont très utiles.",
      date: "10 Jan 2024",
      status: "En attente",
    },
    {
      id: 4,
      user: "Pierre Dubois",
      course: "Formation Data Science",
      rating: 3,
      comment: "Le contenu est correct mais manque de profondeur sur certains sujets.",
      date: "08 Jan 2024",
      status: "Rejeté",
    },
  ])

  const filteredReviews = reviews.filter(
    (review) =>
      review.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approuvé":
        return "default"
      case "En attente":
        return "outline"
      case "Rejeté":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
      />
    ))
  }

  const handleApproveReview = () => {
    if (selectedReview) {
      setReviews(
        reviews.map((r) =>
          r.id === selectedReview.id
            ? { ...r, status: approveAction === "approve" ? "Approuvé" : "Rejeté" }
            : r
        )
      )
    }
  }

  const handleDeleteReview = () => {
    if (selectedReview) {
      setReviews(reviews.filter((r) => r.id !== selectedReview.id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Commentaires et Avis</CardTitle>
            <CardDescription>Gérez tous les avis des étudiants sur les formations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un avis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead className="hidden sm:table-cell">Formation</TableHead>
                <TableHead className="hidden sm:table-cell">Note</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState icon={MessageSquare} title="Aucun avis trouvé" description="Aucun avis ne correspond à votre recherche" />
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={review.avatar} alt={review.user} />
                          <AvatarFallback>
                            {review.user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          <p>{review.user}</p>
                          <div className="flex items-center gap-2 sm:hidden text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <p className="truncate max-w-[150px]">{review.course}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {review.course}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px] md:max-w-sm">
                      <p className="text-sm truncate flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                        {review.comment}
                      </p>
                      <div className="flex items-center gap-1 sm:hidden mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {review.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(review.status) as any}>{review.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReview(review)
                              setShowViewModal(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          {review.status === "En attente" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReview(review)
                                  setApproveAction("approve")
                                  setShowApproveModal(true)
                                }}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReview(review)
                                  setApproveAction("reject")
                                  setShowApproveModal(true)
                                }}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedReview(review)
                              handleDeleteReview()
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ViewReviewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        review={selectedReview}
      />
      {selectedReview && (
        <ApproveReviewModal
          open={showApproveModal}
          onOpenChange={setShowApproveModal}
          review={selectedReview}
          action={approveAction}
          onConfirm={handleApproveReview}
        />
      )}
    </Card>
  )
}

