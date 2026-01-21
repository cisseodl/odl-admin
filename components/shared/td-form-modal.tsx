"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { tdSchema, type TDFormData } from "@/lib/validations/td"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useState, useEffect, useRef } from "react"
import { fileUploadService } from "@/services/file-upload.service"
import { courseService, lessonService } from "@/services"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { X, Upload, File } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Course } from "@/models"
import { Lesson } from "@/models/lesson.model"

type TDFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<TDFormData>
  onSubmit: (data: TDFormData) => void
  submitLabel?: string
}

export function TDFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: TDFormModalProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFile, setUploadingFile] = useState<boolean>(false)
  const [tpFileUrl, setTpFileUrl] = useState<string>(defaultValues?.tpFileUrl || "")
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(defaultValues?.courseId || null)

  const formDefaults: Partial<TDFormData> = {
    title: defaultValues?.title || "",
    description: defaultValues?.description || "",
    courseId: defaultValues?.courseId,
    lessonId: defaultValues?.lessonId,
    tpInstructions: defaultValues?.tpInstructions || "",
    tpFileUrl: defaultValues?.tpFileUrl || "",
  }

  // Charger les cours de l'instructeur
  useEffect(() => {
    if (open && user?.id) {
      const fetchCourses = async () => {
        setLoadingCourses(true)
        try {
          const coursesData = await courseService.getCoursesByInstructorId(Number(user.id))
          setCourses(Array.isArray(coursesData) ? coursesData : [])
        } catch (err: any) {
          console.error("Error fetching courses:", err)
          toast({
            title: "Erreur",
            description: "Impossible de charger les cours.",
            variant: "destructive",
          })
        } finally {
          setLoadingCourses(false)
        }
      }
      fetchCourses()
    }
  }, [open, user?.id, toast])

  // Charger les leçons quand un cours est sélectionné
  useEffect(() => {
    if (open && selectedCourseId) {
      const fetchLessons = async () => {
        setLoadingLessons(true)
        try {
          const lessonsData = await lessonService.getLessonsByCourse(selectedCourseId)
          setLessons(lessonsData)
        } catch (err: any) {
          console.error("Error fetching lessons:", err)
          toast({
            title: "Erreur",
            description: "Impossible de charger les leçons.",
            variant: "destructive",
          })
        } finally {
          setLoadingLessons(false)
        }
      }
      fetchLessons()
    } else {
      setLessons([])
    }
  }, [open, selectedCourseId, toast])

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    if (open && defaultValues) {
      setTpFileUrl(defaultValues.tpFileUrl || "")
      setSelectedCourseId(defaultValues.courseId || null)
    } else if (open && !defaultValues) {
      setTpFileUrl("")
      setSelectedCourseId(null)
      setLessons([])
    }
  }, [open, defaultValues])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      toast({
        title: "Upload en cours...",
        description: `Upload de ${file.name}...`,
      })

      const uploadedUrl = await fileUploadService.uploadFile(file, "tds")
      setTpFileUrl(uploadedUrl)
      toast({
        title: "Succès",
        description: `${file.name} uploadé avec succès`,
      })
    } catch (error: any) {
      console.error("Erreur lors de l'upload du fichier:", error)
      toast({
        title: "Erreur d'upload",
        description: `Impossible d'uploader ${file.name}: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveFile = () => {
    setTpFileUrl("")
    toast({
      title: "Fichier retiré",
      description: "Le fichier a été retiré",
    })
  }

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSubmit={(data) => {
        const formData = {
          ...data,
          tpFileUrl: tpFileUrl || undefined,
        }
        onSubmit(formData)
      }}
      submitLabel={submitLabel}
      resolver={zodResolver(tdSchema)}
      defaultValues={formDefaults}
    >
      {(form) => (
        <>
          <FormField
            type="input"
            name="title"
            label="Titre du TD *"
            placeholder="Exercices sur AWS"
            register={form.register}
            error={form.formState.errors.title?.message}
          />
          <FormField
            type="textarea"
            name="description"
            label="Description"
            placeholder="Décrivez ce que ce TD permet d'apprendre..."
            register={form.register}
            rows={3}
            error={form.formState.errors.description?.message}
          />

          {/* Sélecteur de cours */}
          <div className="grid gap-2 w-full">
            <Label className="w-full break-words">Cours *</Label>
            <Controller
              name="courseId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : "__none__"}
                  onValueChange={(value) => {
                    const courseId = value && value !== "__none__" ? Number(value) : null
                    field.onChange(courseId)
                    setSelectedCourseId(courseId)
                    form.setValue("lessonId", undefined, { shouldValidate: false })
                    setLessons([])
                  }}
                  disabled={loadingCourses}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCourses ? "Chargement..." : "Sélectionner un cours"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" disabled>Sélectionner un cours</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title || `Cours #${course.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.courseId && (
              <p className="text-sm text-destructive">{form.formState.errors.courseId.message}</p>
            )}
          </div>

          {/* Sélecteur de leçon */}
          {selectedCourseId && (
            <div className="grid gap-2 w-full">
              <Label className="w-full break-words">Leçon associée *</Label>
              <Controller
                name="lessonId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : "__none__"}
                    onValueChange={(value) => {
                      field.onChange(value && value !== "__none__" ? Number(value) : null)
                    }}
                    disabled={loadingLessons}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingLessons ? "Chargement..." : "Sélectionner une leçon"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" disabled>Sélectionner une leçon</SelectItem>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={String(lesson.id)}>
                          {lesson.title || `Leçon #${lesson.id}`}
                          {lesson.module?.title && ` (${lesson.module.title})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.lessonId && (
                <p className="text-sm text-destructive">{form.formState.errors.lessonId.message}</p>
              )}
            </div>
          )}

          <FormField
            type="textarea"
            name="tpInstructions"
            label="Instructions du TD *"
            placeholder="Décrivez les instructions pour ce TD..."
            register={form.register}
            rows={6}
            error={form.formState.errors.tpInstructions?.message}
          />

          {/* Upload de fichier TP (optionnel) */}
          <div className="grid gap-2 w-full">
            <Label className="w-full break-words">Fichier TP (optionnel)</Label>
            {tpFileUrl ? (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{tpFileUrl.split('/').pop() || "Fichier uploadé"}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploadingFile}
                  className="hidden"
                  id="td-file-upload"
                  accept=".pdf,.doc,.docx,.zip"
                />
                <Label
                  htmlFor="td-file-upload"
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFile ? "Upload en cours..." : "Télécharger un fichier"}
                </Label>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Formats acceptés: PDF, DOC, DOCX, ZIP</p>
          </div>
        </>
      )}
    </ModalForm>
  )
}

