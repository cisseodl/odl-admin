"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UseFormReturn } from "react-hook-form"
import type { Step1BasicInfoData } from "@/lib/validations/course-builder"
import { BookOpen, User, Tag, Globe, GraduationCap } from "lucide-react"
import { Categorie } from "@/models";
import { Instructor } from "@/services/instructor.service";
import { PageLoader } from "@/components/ui/page-loader";


type Step1BasicInfoProps = {
  form: UseFormReturn<Step1BasicInfoData>;
  categories: Categorie[];
  instructors: Instructor[];
  loading: boolean;
}

export function Step1BasicInfo({ form, categories, instructors, loading }: Step1BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Informations de base</h3>
        <p className="text-sm text-muted-foreground">
          Définissez les informations essentielles de votre formation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Titre et description
          </CardTitle>
          <CardDescription>Ces informations apparaîtront dans le catalogue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la formation *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Ex: Formation React Avancé - Hooks, Context et Performance"
              className={form.formState.errors.title ? "border-destructive" : ""}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Choisissez un titre accrocheur et descriptif (60-90 caractères recommandés)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Sous-titre (optionnel)</Label>
            <Input
              id="subtitle"
              {...form.register("subtitle")}
              placeholder="Ex: Maîtrisez React avec des projets pratiques"
            />
            <p className="text-xs text-muted-foreground">
              Un sous-titre court qui complète le titre (120 caractères max)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Décrivez votre formation en détail. Qu'allez-vous apprendre ? À qui s'adresse cette formation ?"
              rows={6}
              className={form.formState.errors.description ? "border-destructive" : ""}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 10 caractères. Soyez détaillé pour attirer les apprenants.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Catégorisation
          </CardTitle>
          <CardDescription>Classifiez votre formation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
                disabled={loading}
              >
                <SelectTrigger id="category" className={form.formState.errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner une catégorie"} />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading-state" disabled>Chargement...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>Aucune catégorie disponible</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Niveau *</Label>
              <Select
                value={form.watch("level")}
                onValueChange={(value) => form.setValue("level", value as Step1BasicInfoData["level"])}
              >
                <SelectTrigger id="level" className={form.formState.errors.level ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Débutant">Débutant</SelectItem>
                  <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="Avancé">Avancé</SelectItem>
                  <SelectItem value="Tous niveaux">Tous niveaux</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.level && (
                <p className="text-sm text-destructive">{form.formState.errors.level.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Langue *</Label>
            <Select
              value={form.watch("language")}
              onValueChange={(value) => form.setValue("language", value)}
            >
              <SelectTrigger id="language" className={form.formState.errors.language ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Français">Français</SelectItem>
                <SelectItem value="Anglais">Anglais</SelectItem>
                <SelectItem value="Espagnol">Espagnol</SelectItem>
                <SelectItem value="Arabe">Arabe</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.language && (
              <p className="text-sm text-destructive">{form.formState.errors.language.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Formateur
          </CardTitle>
          <CardDescription>Qui enseigne cette formation ?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="instructor">Formateur *</Label>
            <Select
                value={form.watch("instructor")}
                onValueChange={(value) => form.setValue("instructor", value)}
                disabled={loading}
              >
                <SelectTrigger id="instructor" className={form.formState.errors.instructor ? "border-destructive" : ""}>
                  <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner un formateur"} />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading-state" disabled>Chargement...</SelectItem>
                  ) : instructors.length === 0 ? (
                    <SelectItem value="no-instructors" disabled>Aucun formateur disponible</SelectItem>
                  ) : (
                    instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={String(instructor.id)}>
                        {instructor.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            {form.formState.errors.instructor && (
              <p className="text-sm text-destructive">{form.formState.errors.instructor.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

