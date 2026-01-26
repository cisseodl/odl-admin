"use client"

import { useLanguage } from "@/contexts/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewsList } from "@/components/admin/reviews-list"
import { CommentsList } from "@/components/admin/comments-list" // Import the new CommentsList
import { MessageSquare, Star } from "lucide-react"

export default function ReviewsPage() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('reviews.title')}</h1>
        <p className="text-muted-foreground">{t('reviews.description')}</p>
      </div>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            <Star className="h-4 w-4 mr-2" />
            {t('reviews.tabs.reviews')}
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('reviews.tabs.comments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsList />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <CommentsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
