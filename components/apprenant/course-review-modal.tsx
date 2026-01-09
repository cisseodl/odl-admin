// components/apprenant/course-review-modal.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Star } from "lucide-react"
import { useState } from "react"

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Veuillez donner une note de 1 à 5.").max(5, "Veuillez donner une note de 1 à 5."),
  comment: z.string().min(10, "Le commentaire doit contenir au moins 10 caractères.").max(500, "Le commentaire ne peut excéder 500 caractères."),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>

type CourseReviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ReviewFormData) => void
  defaultValues?: Partial<ReviewFormData>
}

export function CourseReviewModal({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: CourseReviewModalProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      ...defaultValues,
    },
  });

  const currentRating = form.watch("rating");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laisser un avis</DialogTitle>
          <DialogDescription>
            Partagez votre expérience et notez ce cours.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <Star
                          key={starValue}
                          className={`h-6 w-6 cursor-pointer ${
                            (hoverRating || currentRating) >= starValue
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => field.onChange(starValue)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaire</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="J'ai beaucoup appris de ce cours..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Soumettre l'avis</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
