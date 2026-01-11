"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, ChevronRight } from "lucide-react"
import type { CourseFormData } from "../formation-builder-wizard"
import { Categorie } from "@/models"
import { ApiInstructor } from "@/services/instructor.service"

type StepCourseProps = {
  onSubmit: (data: CourseFormData) => void
  categories: Categorie[]
  instructors: ApiInstructor[]
  loading: boolean
  defaultValues?: Partial<CourseFormData>
}

export function StepCourse({ onSubmit, categories, instructors, loading, defaultValues }: StepCourseProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState(defaultValues?.title || "")
  const [subtitle, setSubtitle] = useState(defaultValues?.subtitle || "")
  const [description, setDescription] = useState(defaultValues?.description || "")
  const [categoryId, setCategoryId] = useState<number | undefined>(defaultValues?.categoryId)
  const [instructorId, setInstructorId] = useState<number | undefined>(defaultValues?.instructorId)
  const [imageFile, setImageFile] = useState<File | undefined>(defaultValues?.imageFile)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !description.trim() || !categoryId || !instructorId) {
      return
    }

    onSubmit({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim(),
      categoryId,
      instructorId,
      level: "DEBUTANT", // Valeur par défaut
      language: "Français", // Valeur par défaut
      objectives: [],
      features: [],
      imageFile,
    })
  }

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('course_form.title_label')}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('course_form.title_placeholder')}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">{t('course_form.subtitle_label')}</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={t('course_form.subtitle_placeholder')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('course_form.description_label')}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('course_form.description_placeholder')}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">{t('course_form.category_label')}</Label>
          <Select
            value={categoryId ? String(categoryId) : ""}
            onValueChange={(value) => setCategoryId(Number(value))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder={t('course_form.category_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructor">{t('course_form.instructor_label')}</Label>
          <Select
            value={instructorId ? String(instructorId) : ""}
            onValueChange={(value) => {
              console.log("Selected instructor value:", value)
              setInstructorId(Number(value))
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder={instructors.length === 0 ? t('course_form.instructor_no_available') : t('course_form.instructor_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {instructors.length === 0 ? (
                <SelectItem value="" disabled>{t('course_form.instructor_no_available')}</SelectItem>
              ) : (
                instructors.map((inst) => {
                  // Utiliser userId car c'est l'ID de l'utilisateur qui est requis par le backend
                  const instructorUserId = inst.userId || inst.id
                  const displayName = inst.fullName || inst.email || t('course_form.instructor_default', { id: instructorUserId })
                  console.log("Instructor option:", { id: inst.id, userId: inst.userId, fullName: inst.fullName, email: inst.email })
                  return (
                    <SelectItem key={inst.id} value={String(instructorUserId)}>
                      {displayName}
                    </SelectItem>
                  )
                })
              )}
            </SelectContent>
          </Select>
          {instructors.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('course_form.instructor_no_available_message')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">{t('course_form.image_label')}</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="cursor-pointer"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!title.trim() || !description.trim() || !categoryId || !instructorId}>
          {t('course_form.continue_to_modules')}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  )
}
