"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare, BookOpen, Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface ReviewDetailModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  review: {
    id: number
    user: string
    course: string
    rating: number
    comment: string
    date: string
    avatar?: string
  } | null
}

export function ReviewDetailModal({ isOpen, onOpenChange, review }: ReviewDetailModalProps) {
  const { t } = useLanguage()

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('reviews.modals.detail_title')}</DialogTitle>
          <DialogDescription>
            {t('reviews.modals.detail_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={review.avatar} alt={review.user} />
              <AvatarFallback className="text-xl">
                {review.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg">{review.user}</p>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(review.rating)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {t('reviews.list.header_course')}: <span className="text-foreground">{review.course}</span>
            </p>
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {t('reviews.list.header_date')}: <span className="text-foreground">{review.date}</span>
            </p>
          </div>

          <Separator />

          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <MessageSquare className="h-4 w-4" />
              {t('reviews.list.header_comment')}:
            </p>
            <div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{review.comment}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
