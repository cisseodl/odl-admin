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

const courseFormSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères."),
  subtitle: z.string().min(2, "Le sous-titre doit contenir au moins 2 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  language: z.string().min(2, "La langue doit contenir au moins 2 caractères."),
  categoryId: z.number(),
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
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues,
  })

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
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduction à..." {...field} />
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
                  <FormLabel>Sous-titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Apprenez les bases de..." {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ce cours couvre..." {...field} />
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
                  <FormLabel>Niveau</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Débutant</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                      <SelectItem value="ADVANCED">Avancé</SelectItem>
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
                  <FormLabel>Langue</FormLabel>
                  <FormControl>
                    <Input placeholder="Français" {...field} />
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
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
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
                        <SelectItem value="__no_category__" disabled>Aucune catégorie disponible</SelectItem>
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