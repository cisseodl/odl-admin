"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { reviewService, type Review as ApiReview } from "@/services/review.service"
import { useToast } from "@/hooks/use-toast"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"
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
import { Search, MoreHorizontal, Check, X, Star, Trash2, Eye, MessageSquare, BookOpen, Calendar, Edit } from "lucide-react"
import { EmptyState } from "./empty-state"
import { ReviewDetailModal } from "./modals/review-detail-modal" // Import the new modal
// import { ViewReviewModal } from "./modals/view-review-modal" // Ne plus importer car on le gère en ligne ou avec un modal plus générique
// import { ApproveReviewModal } from "./modals/approve-review-modal" // Ne plus importer, géré en ligne

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


type Review = {
  id: number
  user: string
  course: string
  rating: number
  comment: string
  date: string
  avatar?: string
  rejectionReason?: string
}

export function ReviewsList() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const dialog = useActionResultDialog()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const apiReviews = await reviewService.getAllReviews()
      // Convertir les reviews de l'API au format attendu par le composant
      const formattedReviews: Review[] = apiReviews.map((apiReview: ApiReview) => ({
        id: apiReview.id,
        user: apiReview.user?.fullName || apiReview.user?.email || t('reviews.unknown_user'),
        course: apiReview.course?.title || t('reviews.unknown_course'),
        rating: apiReview.rating || 0,
        comment: apiReview.comment || "",
        date: apiReview.createdAt ? new Date(apiReview.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "Date inconnue",
        avatar: apiReview.user?.avatar,
        status: "Approuvé" as const, // Le backend n'a pas de statut, on considère tout comme approuvé
      }))
      setReviews(formattedReviews)
    } catch (error: any) {
      console.error("Error fetching reviews:", error)
      toast({
        title: t('common.error'),
        description: error.message || t('reviews.toasts.error_fetch'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReviews = reviews.filter(
    (review) =>
      review.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  )



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



  const handleDelete = async () => {
    if (selectedReview) {
      try {
        await reviewService.deleteReview(selectedReview.id);
        setReviews(reviews.filter((r) => r.id !== selectedReview.id));
        dialog.showSuccess(t('reviews.toasts.delete_success'));
      } catch (error: any) {
        console.error("Error deleting review:", error);
        dialog.showError(error.message || t('reviews.toasts.delete_error'));
      } finally {
        setShowDeleteModal(false);
        setSelectedReview(null);
      }
    }
  };

  const handleSaveEdit = (editedReview: Review) => {
    setReviews(
      reviews.map((r) => (r.id === editedReview.id ? { ...editedReview, status: t('reviews.list.status_pending') as const } : r)) // Remettre en attente si modifié
    )
    setShowEditModal(false)
    setSelectedReview(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('reviews.list.title')}</CardTitle>
            <CardDescription>{t('reviews.list.description')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('reviews.list.search_placeholder')}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement des commentaires...
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('reviews.list.header_actions')}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReview(review)
                              setShowDetailModal(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t('reviews.list.action_view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReview(review)
                              setShowEditModal(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t('reviews.list.action_edit')}
                          </DropdownMenuItem>
                          {review.status === t('reviews.list.status_pending') && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReview(review)
                                  setShowApproveModal(true)
                                }}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                {t('reviews.list.action_approve')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReview(review)
                                  setShowRejectModal(true)
                                }}
                              >
                                <X className="mr-2 h-4 w-4" />
                                {t('reviews.list.action_reject')}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedReview(review)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('reviews.list.action_delete')}
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

      {/* Modal Modifier (Edit Review) */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('reviews.modals.edit_title')}</DialogTitle>
            <DialogDescription>
              {t('reviews.modals.edit_description').replace('{{user}}', selectedReview?.user || '').replace('{{course}}', selectedReview?.course || '')}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">
                  {t('reviews.list.header_user')}
                </Label>
                <Input id="user" value={selectedReview.user} onChange={(e) => setSelectedReview({ ...selectedReview, user: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">
                  {t('reviews.list.header_course')}
                </Label>
                <Input id="course" value={selectedReview.course} onChange={(e) => setSelectedReview({ ...selectedReview, course: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">
                  {t('reviews.list.header_rating')}
                </Label>
                <Select
                  value={String(selectedReview.rating)}
                  onValueChange={(value) => setSelectedReview({ ...selectedReview, rating: parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('reviews.modals.rating_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={String(r)}>{r} {t('reviews.modals.stars')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="comment" className="text-right mt-2">
                  {t('reviews.list.header_comment')}
                </Label>
                <Textarea id="comment" value={selectedReview.comment} onChange={(e) => setSelectedReview({ ...selectedReview, comment: e.target.value })} className="col-span-3 min-h-[100px]" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => selectedReview && handleSaveEdit(selectedReview)}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <ReviewDetailModal
        isOpen={showDetailModal}
        onOpenChange={setShowDetailModal}
        review={selectedReview}
      />

      {/* Modal Supprimer (Delete Review) */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reviews.modals.delete_title')}</DialogTitle>
            <DialogDescription>
              {t('reviews.modals.delete_description').replace('{{user}}', selectedReview?.user || '').replace('{{course}}', selectedReview?.course || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('reviews.modals.delete_confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de résultat */}
      <ActionResultDialog
        isOpen={dialog.isOpen}
        onOpenChange={dialog.setIsOpen}
        isSuccess={dialog.isSuccess}
        message={dialog.message}
        title={dialog.title}
      />
    </Card>
  )
}

