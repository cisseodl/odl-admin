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
import { Categorie, Formation } from "@/models"
import { useLanguage } from "@/contexts/language-context"
import { formationService } from "@/services"
import { useEffect, useState } from "react"

const courseFormSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères."),
  subtitle: z.string().min(2, "Le sous-titre doit contenir au moins 2 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  language: z.string().min(2, "La langue doit contenir au moins 2 caractères."),
  categoryId: z.number().optional(),
  formationId: z.number().optional(),
}).refine((data) => {
  // La formation est requise si une catégorie est sélectionnée
  if (data.categoryId) {
    return !!data.formationId;
  }
  return true;
}, {
  message: "Vous devez sélectionner une formation pour cette catégorie",
  path: ["formationId"],
})

export type CourseFormData = z.infer<typeof courseFormSchema>

type CourseFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onSubmit: (data: CourseFormData) => void
  submitLabel: string
  defaultValues?: Partial<CourseFormData>
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
  const [formations, setFormations] = useState<Formation[]>([])
  const [loadingFormations, setLoadingFormations] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues,
  })

  // Charger les formations quand une catégorie est sélectionnée
  useEffect(() => {
    const categoryId = form.watch("categoryId")
    if (categoryId && categoryId !== selectedCategoryId) {
      setSelectedCategoryId(categoryId)
      loadFormations(categoryId)
    } else if (!categoryId) {
      setFormations([])
      setSelectedCategoryId(null)
      form.setValue("formationId", undefined)
    }
  }, [form.watch("categoryId")])

  const loadFormations = async (categorieId: number) => {
    setLoadingFormations(true)
    try {
      const formationsData = await formationService.getFormationsByCategorieId(categorieId)
      setFormations(formationsData)
    } catch (error) {
      console.error("Error loading formations:", error)
      setFormations([])
    } finally {
      setLoadingFormations(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto flex-1 pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('course_form.title_label') || "Titre"}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('course_form.title_placeholder') || "Introduction à..."} {...field} />
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
                    <Input placeholder={t('course_form.subtitle_placeholder') || "Apprenez les bases de..."} {...field} />
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
                    <Textarea placeholder={t('course_form.description_placeholder') || "Ce cours couvre..."} {...field} />
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
                  <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
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
                    <Input placeholder={t('course_form.language_placeholder') || "Français"} {...field} />
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
                      form.setValue("formationId", undefined) // Réinitialiser la formation
                    }} 
                    value={field.value ? String(field.value) : "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('course_form.category_placeholder') || "Sélectionnez une catégorie"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__" disabled>{t('course_form.category_placeholder') || "Sélectionnez une catégorie"}</SelectItem>
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
            
            {/* Sélecteur de Formation (apparaît après sélection d'une catégorie) */}
            {form.watch("categoryId") && (
              <FormField
                control={form.control}
                name="formationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('course_form.formation_label') || "Formation *"}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value && value !== "__none__" ? Number(value) : undefined)} 
                      value={field.value ? String(field.value) : "__none__"}
                      required
                      disabled={loadingFormations}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingFormations ? (t('common.loading') || "Chargement...") : (t('course_form.formation_placeholder') || "Sélectionnez une formation (optionnel)")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__" disabled>{t('course_form.formation_placeholder') || "Sélectionnez une formation"}</SelectItem>
                        {formations.length > 0 ? (
                          formations.map((formation) => (
                            <SelectItem key={formation.id} value={String(formation.id)}>
                              {formation.title}
                            </SelectItem>
                          ))
                        ) : (
                          !loadingFormations && (
                            <SelectItem value="__no_formation__" disabled>
                              {t('course_form.no_formation_available') || "Aucune formation disponible pour cette catégorie"}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {!loadingFormations && formations.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Aucune formation disponible pour cette catégorie. Vous devez d'abord créer une formation avant de créer un cours.
                      </p>
                    )}
                    {formations.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Sélectionnez la formation adaptée à votre cours. Par exemple, le cours "JavaScript" sera lié à la formation "Développement Web".
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}
            
            <Button type="submit">{submitLabel}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}