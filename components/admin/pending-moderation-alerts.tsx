"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, FileText, BookOpen, MessageSquare, Users, CheckCircle2, XCircle, Eye } from "lucide-react"
import Link from "next/link"

type PendingItem = {
  id: number
  type: "content" | "course" | "review" | "instructor"
  title: string
  author?: string
  submittedAt: string
  priority?: "high" | "medium" | "low"
}

export function PendingModerationAlerts() {
  const pendingItems: PendingItem[] = [
    {
      id: 1,
      type: "course",
      title: "Formation React Avancé - Nouvelle version",
      author: "Jean Dupont",
      submittedAt: "Il y a 2 heures",
      priority: "high",
    },
    {
      id: 2,
      type: "content",
      title: "Vidéo : Introduction à TypeScript",
      author: "Marie Martin",
      submittedAt: "Il y a 5 heures",
      priority: "medium",
    },
    {
      id: 3,
      type: "review",
      title: "Avis sur Formation Node.js",
      author: "Sophie Bernard",
      submittedAt: "Il y a 1 jour",
      priority: "low",
    },
    {
      id: 4,
      type: "instructor",
      title: "Demande d'inscription instructeur",
      author: "Lucas Petit",
      submittedAt: "Il y a 2 jours",
      priority: "medium",
    },
  ]

  const getTypeIcon = (type: PendingItem["type"]) => {
    switch (type) {
      case "content":
        return <FileText className="h-4 w-4" />
      case "course":
        return <BookOpen className="h-4 w-4" />
      case "review":
        return <MessageSquare className="h-4 w-4" />
      case "instructor":
        return <Users className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: PendingItem["type"]) => {
    switch (type) {
      case "content":
        return "Contenu"
      case "course":
        return "Formation"
      case "review":
        return "Avis"
      case "instructor":
        return "Instructeur"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-primary text-primary-foreground border-primary"
      case "medium":
        return "bg-muted text-muted-foreground border-muted"
      case "low":
        return "bg-muted/50 text-muted-foreground border-muted/50"
      default:
        return "bg-muted/30 text-muted-foreground"
    }
  }

  const totalPending = pendingItems.length
  const highPriorityCount = pendingItems.filter((item) => item.priority === "high").length

  if (totalPending === 0) {
    return null
  }

  return (
    <Card className="border-primary/30 dark:border-primary/20 shadow-lg">
      <CardHeader className="bg-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            <CardTitle className="text-xl font-semibold leading-tight text-primary-foreground">Actions Requises</CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30">
            {totalPending} en attente
          </Badge>
        </div>
        <CardDescription className="text-primary-foreground/90">
          {highPriorityCount > 0 && (
            <span className="text-primary-foreground font-medium">{highPriorityCount} priorité haute</span>
          )}
          {highPriorityCount > 0 && totalPending > highPriorityCount && " • "}
          {totalPending > highPriorityCount && `${totalPending - highPriorityCount} autres`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border shadow-sm hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.priority && (
                      <Badge className={`text-xs ${
                        item.priority === "high" 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : item.priority === "medium"
                          ? "bg-muted text-muted-foreground border-muted"
                          : "bg-muted/50 text-muted-foreground border-muted/50"
                      }`}>
                        {item.priority === "high" ? "Haute" : item.priority === "medium" ? "Moyenne" : "Basse"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{getTypeLabel(item.type)}</span>
                    {item.author && (
                      <>
                        <span>•</span>
                        <span>{item.author}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{item.submittedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 dark:hover:bg-primary/20">
                  <Link href={`/admin/moderation?type=${item.type}&id=${item.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="default" size="sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approuver
                </Button>
                <Button variant="destructive" size="sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </div>
            </div>
          ))}
          {pendingItems.length > 3 && (
            <div className="pt-2 border-t">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <Link href="/admin/moderation">
                  Voir tous les éléments en attente ({totalPending})
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

