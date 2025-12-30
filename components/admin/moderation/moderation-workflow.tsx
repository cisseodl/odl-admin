"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  History,
  MessageSquare,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"

type ModerationItem = {
  id: string
  type: "content" | "course" | "review" | "instructor"
  title: string
  author: string
  submittedAt: string
  status: "pending" | "approved" | "rejected" | "changes_requested"
  currentVersion: {
    title: string
    description: string
    content?: string
  }
  previousVersion?: {
    title: string
    description: string
    content?: string
  }
  history: Array<{
    action: string
    user: string
    date: string
    comment?: string
  }>
}

type ModerationWorkflowProps = {
  item: ModerationItem
  onApprove: (itemId: string, comment?: string) => void
  onReject: (itemId: string, reason: string) => void
  onRequestChanges: (itemId: string, comment: string) => void
}

export function ModerationWorkflow({ item, onApprove, onReject, onRequestChanges }: ModerationWorkflowProps) {
  const [activeTab, setActiveTab] = useState<"review" | "history" | "compare">("review")
  const [comment, setComment] = useState("")
  const [showDiff, setShowDiff] = useState(false)

  const getStatusBadge = () => {
    switch (item.status) {
      case "pending":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">En attente</Badge>
      case "approved":
        return <Badge variant="default" className="bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] border-[hsl(var(--success))]/30">Approuvé</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>
      case "changes_requested":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Modifications demandées</Badge>
    }
  }

  const getTypeLabel = () => {
    switch (item.type) {
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl">{item.title}</CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription>
                {getTypeLabel()} soumis par {item.author} le {format(new Date(item.submittedAt), "PPP")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">Révision</TabsTrigger>
          <TabsTrigger value="compare">Comparaison</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Onglet Révision */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contenu actuel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Titre</Label>
                <p className="mt-1 p-3 bg-muted rounded-md">{item.currentVersion.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {item.currentVersion.description}
                </p>
              </div>
              {item.currentVersion.content && (
                <div>
                  <Label className="text-sm font-medium">Contenu</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{item.currentVersion.content}</pre>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="comment">Commentaire (optionnel)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ajoutez un commentaire pour l'auteur..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={() => onApprove(item.id, comment)}
                  className="flex-1"
                  disabled={item.status !== "pending"}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (comment.trim()) {
                      onRequestChanges(item.id, comment)
                    }
                  }}
                  className="flex-1"
                  disabled={item.status !== "pending" || !comment.trim()}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Demander des modifications
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (comment.trim()) {
                      onReject(item.id, comment)
                    }
                  }}
                  className="flex-1"
                  disabled={item.status !== "pending" || !comment.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Comparaison */}
        <TabsContent value="compare" className="space-y-4">
          {item.previousVersion ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Version précédente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Titre</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md line-through text-muted-foreground">
                      {item.previousVersion.title}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap line-through text-muted-foreground">
                      {item.previousVersion.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Version actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Titre</Label>
                    <p className="mt-1 p-3 bg-[hsl(var(--success))]/10 dark:bg-[hsl(var(--success))]/20 rounded-md border border-[hsl(var(--success))]/30 dark:border-[hsl(var(--success))]/40">
                      {item.currentVersion.title}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="mt-1 p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800 whitespace-pre-wrap">
                      {item.currentVersion.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune version précédente disponible</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique des modifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.history.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {index < item.history.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{entry.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(entry.date), "PPP")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <User className="h-3 w-3" />
                        {entry.user}
                      </div>
                      {entry.comment && (
                        <div className="p-3 bg-muted rounded-md text-sm">
                          <MessageSquare className="h-4 w-4 inline mr-2" />
                          {entry.comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

