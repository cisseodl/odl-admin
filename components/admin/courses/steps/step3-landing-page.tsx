"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { UseFormReturn } from "react-hook-form"
import type { Step3LandingPageData } from "@/lib/validations/course-builder"
import { Upload, Image, Video, X, Plus, Target, Users, BookOpen } from "lucide-react"

type Step3LandingPageProps = {
  form: UseFormReturn<Step3LandingPageData>
}

export function Step3LandingPage({ form }: Step3LandingPageProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [promoVideoFile, setPromoVideoFile] = useState<File | null>(null)
  const learningObjectives = form.watch("learningObjectives") || []
  const prerequisites = form.watch("prerequisites") || []
  const targetAudience = form.watch("targetAudience") || []

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue("thumbnail", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePromoVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPromoVideoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        form.setValue("promotionalVideo", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addLearningObjective = () => {
    const newObjectives = [...learningObjectives, ""]
    form.setValue("learningObjectives", newObjectives)
  }

  const updateLearningObjective = (index: number, value: string) => {
    const newObjectives = [...learningObjectives]
    newObjectives[index] = value
    form.setValue("learningObjectives", newObjectives, { shouldValidate: true })
  }

  const removeLearningObjective = (index: number) => {
    const newObjectives = learningObjectives.filter((_, i) => i !== index)
    form.setValue("learningObjectives", newObjectives, { shouldValidate: true })
  }

  const addPrerequisite = () => {
    const newPrerequisites = [...prerequisites, ""]
    form.setValue("prerequisites", newPrerequisites)
  }

  const updatePrerequisite = (index: number, value: string) => {
    const newPrerequisites = [...prerequisites]
    newPrerequisites[index] = value
    form.setValue("prerequisites", newPrerequisites)
  }

  const removePrerequisite = (index: number) => {
    const newPrerequisites = prerequisites.filter((_, i) => i !== index)
    form.setValue("prerequisites", newPrerequisites)
  }

  const addTargetAudience = () => {
    const newAudience = [...targetAudience, ""]
    form.setValue("targetAudience", newAudience)
  }

  const updateTargetAudience = (index: number, value: string) => {
    const newAudience = [...targetAudience]
    newAudience[index] = value
    form.setValue("targetAudience", newAudience)
  }

  const removeTargetAudience = (index: number) => {
    const newAudience = targetAudience.filter((_, i) => i !== index)
    form.setValue("targetAudience", newAudience)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Page d'accueil de la formation</h3>
        <p className="text-sm text-muted-foreground">
          Créez une page attractive qui convaincra les apprenants de s'inscrire
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="h-4 w-4" />
            Image de couverture
          </CardTitle>
          <CardDescription>Image principale qui apparaîtra dans le catalogue (750x422px recommandé)</CardDescription>
        </CardHeader>
        <CardContent>
          {form.watch("thumbnail") ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <img
                  src={form.watch("thumbnail")}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    form.setValue("thumbnail", undefined)
                    setThumbnailFile(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">Ajouter une image de couverture</p>
              <p className="text-xs text-muted-foreground mb-4">
                JPG, PNG ou GIF (max 2MB). 750x422px recommandé.
              </p>
              <Input
                type="file"
                id="thumbnail-upload"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir une image
                </label>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4" />
            Vidéo promotionnelle (optionnel)
          </CardTitle>
          <CardDescription>Vidéo courte pour présenter votre formation (2-3 minutes)</CardDescription>
        </CardHeader>
        <CardContent>
          {form.watch("promotionalVideo") ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                <video
                  src={form.watch("promotionalVideo")}
                  controls
                  className="w-full h-full"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    form.setValue("promotionalVideo", undefined)
                    setPromoVideoFile(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">Ajouter une vidéo promotionnelle</p>
              <p className="text-xs text-muted-foreground mb-4">
                MP4, MOV ou AVI (max 500MB). 2-3 minutes recommandées.
              </p>
              <Input
                type="file"
                id="promo-video-upload"
                accept="video/*"
                onChange={handlePromoVideoUpload}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <label htmlFor="promo-video-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir une vidéo
                </label>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Objectifs d'apprentissage *
          </CardTitle>
          <CardDescription>Qu'est-ce que les apprenants sauront faire après cette formation ?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {learningObjectives.map((objective, index) => (
            <div key={index} className="flex items-start gap-2">
              <Input
                value={objective}
                onChange={(e) => updateLearningObjective(index, e.target.value)}
                placeholder="Ex: Créer des composants React réutilisables"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLearningObjective(index)}
                disabled={learningObjectives.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addLearningObjective} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un objectif
          </Button>
          {form.formState.errors.learningObjectives && (
            <p className="text-sm text-destructive">
              {form.formState.errors.learningObjectives.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Prérequis (optionnel)
          </CardTitle>
          <CardDescription>Connaissances ou compétences nécessaires avant de commencer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {prerequisites.length > 0 ? (
            prerequisites.map((prerequisite, index) => (
              <div key={index} className="flex items-start gap-2">
                <Input
                  value={prerequisite}
                  onChange={(e) => updatePrerequisite(index, e.target.value)}
                  placeholder="Ex: Connaissances de base en JavaScript"
                />
                <Button variant="ghost" size="icon" onClick={() => removePrerequisite(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun prérequis pour l'instant
            </p>
          )}
          <Button variant="outline" onClick={addPrerequisite} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un prérequis
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Public cible (optionnel)
          </CardTitle>
          <CardDescription>À qui s'adresse cette formation ?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {targetAudience.length > 0 ? (
            targetAudience.map((audience, index) => (
              <div key={index} className="flex items-start gap-2">
                <Input
                  value={audience}
                  onChange={(e) => updateTargetAudience(index, e.target.value)}
                  placeholder="Ex: Développeurs web débutants"
                />
                <Button variant="ghost" size="icon" onClick={() => removeTargetAudience(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun public cible défini
            </p>
          )}
          <Button variant="outline" onClick={addTargetAudience} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un public cible
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

