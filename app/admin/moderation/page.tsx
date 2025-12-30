"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentModerationQueue } from "@/components/admin/content-moderation-queue"
import { CourseModerationQueue } from "@/components/admin/course-moderation-queue"
import { ReviewsList } from "@/components/admin/reviews-list"
import { InstructorModerationQueue } from "@/components/admin/instructor-moderation-queue"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BookOpen, MessageSquare, Users, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ModerationPage() {
  // Données simulées pour les compteurs
  const stats = {
    contents: { pending: 23, approved: 145, rejected: 12 },
    courses: { pending: 5, approved: 89, rejected: 3 },
    reviews: { pending: 8, approved: 234, rejected: 15 },
    instructors: { pending: 2, approved: 45, rejected: 1 },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modération</h1>
        <p className="text-muted-foreground mt-2">Validez et modérez les contenus, formations, avis et instructeurs</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contenus</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contents.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.contents.approved} approuvés • {stats.contents.rejected} rejetés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Formations</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.courses.approved} approuvées • {stats.courses.rejected} rejetées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avis</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviews.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.reviews.approved} approuvés • {stats.reviews.rejected} rejetés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instructeurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instructors.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.instructors.approved} approuvés • {stats.instructors.rejected} rejeté
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes prioritaires */}
      {(stats.contents.pending > 0 || stats.courses.pending > 0 || stats.reviews.pending > 0 || stats.instructors.pending > 0) && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle>Éléments en attente de modération</CardTitle>
            </div>
            <CardDescription>
              {stats.contents.pending + stats.courses.pending + stats.reviews.pending + stats.instructors.pending} élément(s) nécessitent votre attention
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Onglets de modération */}
      <Tabs defaultValue="contents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contenus
            {stats.contents.pending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.contents.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Formations
            {stats.courses.pending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.courses.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Avis
            {stats.reviews.pending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.reviews.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="instructors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Instructeurs
            {stats.instructors.pending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.instructors.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contents" className="space-y-4">
          <ContentModerationQueue />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <CourseModerationQueue />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsList />
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <InstructorModerationQueue />
        </TabsContent>
      </Tabs>
    </div>
  )
}

