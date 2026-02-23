// components/shared/course-form-modal.tsx
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
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Categorie } from "@/models"
import { useLanguage } from "@/contexts/language-context"

const courseFormSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères."),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  language: z.string().min(2, "La langue doit contenir au moins 2 caractères."),
  categoryId: z.number({
    required_error: "La catégorie est requise",
    invalid_type_error: "Veuillez sélectionner une catégorie",
  }).min(1, "La catégorie est requise"),
   // Nouveau champ pour le fichier image
})

export type CourseFormData = z.infer<typeof courseFormSchema>

type CourseFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onSubmit: (data: CourseFormData) => void
  submitLabel: string
  defaultValues?: Partial<CourseFormData> // Ajout de currentImageUrl
  categories: Categorie[]
}

export function CourseFormModal({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel,
  defaultValues,
  categories,
}: CourseFormModalProps) {
  const { t } = useLanguage()
  
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
        ...defaultValues,
        // S'assurer que categoryId est un nombre si présent, sinon undefined
        categoryId: defaultValues?.categoryId ? Number(defaultValues.categoryId) : undefined,
    }
  })

  const handleFormSubmit = (data: CourseFormData) => {
    console.log(">>>> CourseFormModal: Submitting form data:", data); // New log
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 overflow-y-auto flex-1 pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du cours *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('course_form.title_placeholder') || "Introduction à..."} {...field} name={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('course_form.subtitle_label') || "Sous-titre"}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('course_form.subtitle_placeholder') || "Apprenez les bases de..."} {...field} name={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('course_form.description_label') || "Description"}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('course_form.description_placeholder') || "Ce cours couvre..."} {...field} name={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.level') || "Niveau"}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value} name={field.name}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('course_form.level_placeholder') || "Sélectionnez un niveau"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BEGINNER">{t('courses.level_beginner') || "Débutant"}</SelectItem>
                      <SelectItem value="INTERMEDIATE">{t('courses.level_intermediate') || "Intermédiaire"}</SelectItem>
                      <SelectItem value="ADVANCED">{t('courses.level_advanced') || "Avancé"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courses.language') || "Langue"}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('course_form.language_placeholder') || "Français"} {...field} name={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('course_form.category_label') || "Catégorie *"}</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const numValue = value === "__none__" ? undefined : Number(value)
                      field.onChange(numValue)
                    }} 
                    value={field.value ? String(field.value) : "__none__"}
                    name={field.name}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('course_form.category_placeholder') || "Sélectionnez une catégorie"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories && Array.isArray(categories) && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_category__" disabled>{t('course_form.category_no_available') || "Aucune catégorie disponible"}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            
            

            <Button type="submit">{submitLabel}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}