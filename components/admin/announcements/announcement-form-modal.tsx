"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Announcement } from "@/types/notifications"

type AnnouncementFormData = {
  title: string
  content: string
  targetAudience: "all" | "admin" | "instructor" | "student"
  scheduledAt?: string
  status: "draft" | "scheduled" | "sent"
}

type AnnouncementFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement?: Announcement
  onSubmit: (data: Omit<Announcement, "id" | "createdAt" | "readCount" | "totalRecipients">) => void
}

export function AnnouncementFormModal({ open, onOpenChange, announcement, onSubmit }: AnnouncementFormModalProps) {
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    defaultValues: announcement
      ? {
          title: announcement.title,
          content: announcement.content,
          targetAudience: announcement.targetAudience,
          scheduledAt: announcement.scheduledAt,
          status: announcement.status,
        }
      : {
          title: "",
          content: "",
          targetAudience: "all",
          status: "draft",
        },
  })

  useEffect(() => {
    if (announcement) {
      reset({
        title: announcement.title,
        content: announcement.content,
        targetAudience: announcement.targetAudience,
        scheduledAt: announcement.scheduledAt,
        status: announcement.status,
      })
      setScheduleEnabled(!!announcement.scheduledAt)
    } else {
      reset({
        title: "",
        content: "",
        targetAudience: "all",
        status: "draft",
      })
      setScheduleEnabled(false)
    }
  }, [announcement, reset])

  const onFormSubmit = (data: AnnouncementFormData) => {
    onSubmit({
      title: data.title,
      content: data.content,
      targetAudience: data.targetAudience,
      scheduledAt: scheduleEnabled ? data.scheduledAt : undefined,
      status: scheduleEnabled ? "scheduled" : data.status,
      sentAt: undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-tight">
            {announcement ? "Modifier l'annonce" : "Créer une nouvelle annonce"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Rédigez une annonce à envoyer aux utilisateurs
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              {...register("title", { required: "Le titre est requis" })}
              placeholder="Ex: Nouvelle formation disponible"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              {...register("content", { required: "Le contenu est requis" })}
              placeholder="Décrivez votre annonce..."
              rows={6}
              className={errors.content ? "border-destructive" : ""}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Public cible *</Label>
            <Select
              value={watch("targetAudience")}
              onValueChange={(value) => setValue("targetAudience", value as AnnouncementFormData["targetAudience"])}
            >
              <SelectTrigger id="targetAudience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="admin">Administrateurs uniquement</SelectItem>
                <SelectItem value="instructor">Instructeurs uniquement</SelectItem>
                <SelectItem value="student">Étudiants uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Programmer l'envoi</Label>
              <p className="text-sm text-muted-foreground">Envoyer l'annonce à une date précise</p>
            </div>
            <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
          </div>

          {scheduleEnabled && (
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date et heure d'envoi *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                {...register("scheduledAt", { required: scheduleEnabled ? "La date est requise" : false })}
                className={errors.scheduledAt ? "border-destructive" : ""}
              />
              {errors.scheduledAt && <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{announcement ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

