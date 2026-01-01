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
        <h1 className="text-3xl font-bold tracking-tight">Validation</h1>
        <p className="text-muted-foreground mt-2">Gérez les demandes de validation pour les contenus et formations.</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
      </div>

      {/* Alertes prioritaires */}
      {(stats.contents.pending > 0 || stats.courses.pending > 0) && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle>Éléments en attente de validation</CardTitle>
            </div>
            <CardDescription>
              {stats.contents.pending + stats.courses.pending} élément(s) nécessitent votre attention
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Onglets de modération */}
      <Tabs defaultValue="contents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
          <TabsTrigger
            value="contents"
            className="flex items-center gap-2 data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4" />
            Contenus
            {stats.contents.pending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.contents.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="flex items-center gap-2 data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Formations
            {stats.courses.pending > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats.courses.pending}
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
      </Tabs>
    </div>
  )
}

