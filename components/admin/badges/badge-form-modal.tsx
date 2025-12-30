"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { badgeSchema, type BadgeFormData } from "@/lib/validations/badge"
import type { Badge, BadgeType } from "@/types/gamification"
import { BadgePreview } from "./badge-preview"

type BadgeFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  badge?: Badge
  onSubmit: (data: BadgeFormData) => void
}

export function BadgeFormModal({ open, onOpenChange, badge, onSubmit }: BadgeFormModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: badge
      ? {
          name: badge.name,
          description: badge.description,
          type: badge.type,
          icon: badge.icon,
          color: badge.color,
          criteria: badge.criteria,
          enabled: badge.enabled,
        }
      : {
          name: "",
          description: "",
          type: "completion",
          icon: "🎯",
          color: "bg-primary",
          criteria: {
            type: "completion",
            minCourses: 1,
          },
          enabled: true,
        },
  })

  const watchedType = watch("type")
  const watchedIcon = watch("icon")
  const watchedColor = watch("color")
  const watchedName = watch("name")
  const watchedDescription = watch("description")

  useEffect(() => {
    if (badge) {
      reset({
        name: badge.name,
        description: badge.description,
        type: badge.type,
        icon: badge.icon,
        color: badge.color,
        criteria: badge.criteria,
        enabled: badge.enabled,
      })
    } else {
      reset({
        name: "",
        description: "",
        type: "completion",
        icon: "🎯",
        color: "bg-blue-500",
        criteria: {
          type: "completion",
          minCourses: 1,
        },
        enabled: true,
      })
    }
  }, [badge, reset])

  const onFormSubmit = (data: BadgeFormData) => {
    onSubmit(data)
    onOpenChange(false)
  }

  const updateCriteria = (field: string, value: number | string) => {
    const currentCriteria = watch("criteria")
    const newCriteria = {
      ...currentCriteria,
      [field]: value,
    }
    // Mettre à jour le type si nécessaire
    if (field === "type") {
      newCriteria.type = value as BadgeType
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-tight">
            {badge ? "Modifier le badge" : "Créer un nouveau badge"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Configurez les critères et l'apparence du badge
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Aperçu du badge */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <Label className="text-sm font-medium mb-2 block">Aperçu</Label>
            <BadgePreview
              name={watchedName || "Nom du badge"}
              description={watchedDescription || "Description du badge"}
              icon={watchedIcon || "🎯"}
              color={watchedColor || "bg-blue-500"}
            />
          </div>

          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du badge *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ex: Premier Pas"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Ex: Complétez votre première formation"
                className={errors.description ? "border-destructive" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completion">Complétion</SelectItem>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="participation">Participation</SelectItem>
                        <SelectItem value="time">Temps</SelectItem>
                        <SelectItem value="streak">Série</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icône (emoji) *</Label>
                <Input
                  id="icon"
                  {...register("icon")}
                  placeholder="🎯"
                  maxLength={2}
                  className={errors.icon ? "border-destructive" : ""}
                />
                {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Couleur *</Label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-blue-500">Bleu</SelectItem>
                      <SelectItem value="bg-green-500">Vert</SelectItem>
                      <SelectItem value="bg-yellow-500">Jaune</SelectItem>
                      <SelectItem value="bg-orange-500">Orange</SelectItem>
                      <SelectItem value="bg-red-500">Rouge</SelectItem>
                      <SelectItem value="bg-purple-500">Violet</SelectItem>
                      <SelectItem value="bg-pink-500">Rose</SelectItem>
                      <SelectItem value="bg-indigo-500">Indigo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
            </div>
          </div>

          {/* Critères selon le type */}
          <div className="space-y-4 p-4 rounded-lg border">
            <Label className="text-sm font-medium">Critères d'attribution</Label>

            {watchedType === "completion" && (
              <div className="space-y-2">
                <Label htmlFor="minCourses">Nombre minimum de formations complétées</Label>
                <Controller
                  name="criteria.minCourses"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="minCourses"
                      type="number"
                      min="1"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  )}
                />
              </div>
            )}

            {watchedType === "score" && (
              <div className="space-y-2">
                <Label htmlFor="minScore">Score minimum requis (%)</Label>
                <Controller
                  name="criteria.minScore"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="minScore"
                      type="number"
                      min="0"
                      max="100"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            )}

            {(watchedType === "participation" || watchedType === "streak") && (
              <div className="space-y-2">
                <Label htmlFor="consecutiveDays">Jours consécutifs requis</Label>
                <Controller
                  name="criteria.consecutiveDays"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="consecutiveDays"
                      type="number"
                      min="1"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  )}
                />
              </div>
            )}

            {watchedType === "time" && (
              <div className="space-y-2">
                <Label htmlFor="timeSpent">Temps passé requis (heures)</Label>
                <Controller
                  name="criteria.timeSpent"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="timeSpent"
                      type="number"
                      min="0"
                      step="0.5"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Badge actif</Label>
              <p className="text-sm text-muted-foreground">
                Les badges inactifs ne seront pas attribués automatiquement
              </p>
            </div>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{badge ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

