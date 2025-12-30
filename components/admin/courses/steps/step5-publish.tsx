"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UseFormReturn } from "react-hook-form"
import type { Step5PublishData, CourseBuilderFormData } from "@/lib/validations/course-builder"
import { CheckCircle2, AlertCircle, Calendar, Clock, BookOpen, Users, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Step5PublishProps = {
  form: UseFormReturn<Step5PublishData>
  allData: Partial<CourseBuilderFormData>
}

export function Step5Publish({ form, allData }: Step5PublishProps) {
  const structure = allData.structure
  const totalModules = structure?.modules.length || 0
  const totalChapters = structure?.totalChapters || 0
  const totalContentItems = structure?.totalContentItems || 0
  const learningObjectives = allData.learningObjectives || []

  const isReadyToPublish = () => {
    return (
      allData.title &&
      allData.description &&
      allData.category &&
      totalModules > 0 &&
      totalChapters > 0 &&
      learningObjectives.length > 0 &&
      allData.thumbnail
    )
  }

  const ready = isReadyToPublish()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Révision et publication</h3>
        <p className="text-sm text-muted-foreground">
          Vérifiez toutes les informations avant de publier votre formation
        </p>
      </div>

      {/* Checklist de vérification */}
      <Card className={ready ? "border-[hsl(var(--success))]/30 dark:border-[hsl(var(--success))]/40" : "border-primary/30 dark:border-primary/40"}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {ready ? (
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
            ) : (
              <AlertCircle className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="text-base">Vérification de la formation</CardTitle>
          </div>
          <CardDescription>
            {ready
              ? "Votre formation est prête à être publiée !"
              : "Certains éléments doivent être complétés avant la publication"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {allData.title ? (
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm">Titre et description complétés</span>
          </div>
          <div className="flex items-center gap-2">
            {allData.thumbnail ? (
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm">Image de couverture ajoutée</span>
          </div>
          <div className="flex items-center gap-2">
            {totalModules > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm">Au moins un module créé</span>
          </div>
          <div className="flex items-center gap-2">
            {totalChapters > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm">Au moins un chapitre créé</span>
          </div>
          <div className="flex items-center gap-2">
            {learningObjectives.length > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm">Objectifs d'apprentissage définis</span>
          </div>
        </CardContent>
      </Card>

      {/* Résumé de la formation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résumé de la formation</CardTitle>
          <CardDescription>Aperçu des informations principales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Titre</Label>
              <p className="font-medium">{allData.title || "Non défini"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Catégorie</Label>
              <p className="font-medium">{allData.category || "Non définie"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Niveau</Label>
              <Badge variant="outline">{allData.level || "Non défini"}</Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Langue</Label>
              <p className="font-medium">{allData.language || "Non définie"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Modules</p>
                <p className="font-semibold">{totalModules}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Chapitres</p>
                <p className="font-semibold">{totalChapters}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Contenus</p>
                <p className="font-semibold">{totalContentItems}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planification de publication */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planification de publication (optionnel)
          </CardTitle>
          <CardDescription>Publiez immédiatement ou planifiez pour plus tard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publishDate">Date de publication</Label>
              <Input
                id="publishDate"
                type="date"
                value={form.watch("publishDate") || ""}
                onChange={(e) => form.setValue("publishDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishTime">Heure de publication</Label>
              <Input
                id="publishTime"
                type="time"
                value={form.watch("publishTime") || ""}
                onChange={(e) => form.setValue("publishTime", e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Si aucune date n'est spécifiée, la formation sera publiée immédiatement après validation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

