"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { fileUploadService } from "@/services/file-upload.service"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"

export enum LessonType {
  VIDEO = "VIDEO",
  QUIZ = "QUIZ",
  DOCUMENT = "DOCUMENT",
  LAB = "LAB",
}

const lessonSchema = z.object({
  title: z.string().min(2, "Le titre de la leçon doit contenir au moins 2 caractères."),
  lessonOrder: z.number({ required_error: "L'ordre de la leçon est requis." }).min(1, "L'ordre de la leçon doit être au moins 1."),
  type: z.nativeEnum(LessonType, { required_error: "Le type de leçon est requis." }),
  contentUrl: z.string().optional(),
  contentFile: z.any().optional(),
  duration: z.number().optional(),
})

export type LessonFormData = z.infer<typeof lessonSchema>

type LessonFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onSubmit: (data: LessonFormData) => Promise<void>
  submitLabel: string
  defaultValues?: Partial<LessonFormData>
}

export function LessonFormModal({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel,
  defaultValues,
}: LessonFormModalProps) {
  const { t } = useLanguage()
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      lessonOrder: defaultValues?.lessonOrder || 1,
      type: defaultValues?.type || LessonType.DOCUMENT,
      contentUrl: defaultValues?.contentUrl || "",
      duration: defaultValues?.duration,
    },
  })

  const { toast } = useToast()

  const handleSubmit = async (data: LessonFormData) => {
    try {
      let finalData = { ...data }
      
      // Si un fichier est fourni, l'uploader
      if (data.contentFile) {
        const folderName = data.type === LessonType.VIDEO ? "videos" : 
                          data.type === LessonType.DOCUMENT ? "documents" : "labs"
        
        const uploadedUrl = await fileUploadService.uploadFile(data.contentFile, folderName)
        finalData = {
          ...finalData,
          contentUrl: uploadedUrl,
          contentFile: undefined,
        }
      }
      
      await onSubmit(finalData)
      form.reset()
    } catch (error: any) {
      console.error("Error in lesson form:", error)
      toast({
        title: t('common.error') || "Erreur",
        description: error.message || "Une erreur est survenue lors de la sauvegarde de la leçon.",
        variant: "destructive",
      })
    }
  }

  const selectedType = form.watch("type")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('instructor.lessons.form.title') || "Titre de la leçon *"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('instructor.lessons.form.title_placeholder') || "Ex: Introduction à..."} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lessonOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('instructor.lessons.form.order') || "Ordre *"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('instructor.lessons.form.type') || "Type *"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('instructor.lessons.form.type_placeholder') || "Sélectionner un type"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={LessonType.VIDEO}>{t('instructor.lessons.form.type_video') || "Vidéo"}</SelectItem>
                        <SelectItem value={LessonType.DOCUMENT}>{t('instructor.lessons.form.type_document') || "Document"}</SelectItem>
                        <SelectItem value={LessonType.LAB}>{t('instructor.lessons.form.type_lab') || "Lab"}</SelectItem>
                        <SelectItem value={LessonType.QUIZ}>{t('instructor.lessons.form.type_quiz') || "Quiz"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(selectedType === LessonType.VIDEO || selectedType === LessonType.DOCUMENT || selectedType === LessonType.LAB) && (
              <FormField
                control={form.control}
                name="contentFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t('instructor.lessons.form.file') || "Fichier"}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          {...field}
                          type="file"
                          accept={
                            selectedType === LessonType.VIDEO
                              ? "video/*"
                              : selectedType === LessonType.DOCUMENT
                              ? ".pdf,.doc,.docx,.ppt,.pptx,.txt"
                              : "*/*"
                          }
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            onChange(file)
                          }}
                        />
                        {value && (
                          <span className="text-sm text-muted-foreground">
                            {(value as File)?.name}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('instructor.lessons.form.duration') || "Durée (minutes)"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      min="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel') || "Annuler"}
              </Button>
              <Button type="submit">
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
