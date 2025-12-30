"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

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

type ViewReviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: Review | null
}

export function ViewReviewModal({ open, onOpenChange, review }: ViewReviewModalProps) {
  if (!review) return null

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? "fill-primary text-primary" : "text-muted-foreground"
        }`}
      />
    ))
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Détails de l'avis</DialogTitle>
          <DialogDescription>Informations complètes sur cet avis</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={review.avatar} alt={review.user} />
              <AvatarFallback>
                {review.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">{review.user}</div>
              <div className="text-sm text-muted-foreground">{review.course}</div>
            </div>
            <Badge variant={getStatusVariant(review.status) as any}>{review.status}</Badge>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">Note :</span>
              <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
              <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Commentaire :</div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm leading-relaxed">{review.comment}</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">Date : {review.date}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

