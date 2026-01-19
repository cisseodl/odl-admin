"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { labSchema, type LabFormData } from "@/lib/validations/lab"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Controller } from "react-hook-form"
import { useState, useRef, useEffect } from "react"
import { fileUploadService } from "@/services/file-upload.service"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { X, Upload, File } from "lucide-react"


type LabFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<LabFormData>
  onSubmit: (data: LabFormData) => void
  submitLabel?: string
}

export function LabFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: LabFormModalProps) {
  const form = useForm<LabFormData>({
    resolver: zodResolver(labSchema),
    defaultValues,
  })
  
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false)
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>(() => {
    // Initialiser avec les fichiers existants si on édite un lab
    if (defaultValues?.uploadedFiles) {
      try {
        return JSON.parse(defaultValues.uploadedFiles)
      } catch {
        return []
      }
    }
    return []
  })

  // Synchroniser uploadedFileUrls avec le formulaire
  const updateFormWithFileUrls = (urls: string[]) => {
    setUploadedFileUrls(urls)
    form.setValue("uploadedFiles", urls.length > 0 ? JSON.stringify(urls) : "")
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingFiles(true)
    const newUrls: string[] = [...uploadedFileUrls]

    try {
      // Uploader tous les fichiers sélectionnés
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          toast({
            title: "Upload en cours...",
            description: `Upload de ${file.name}...`,
          })

          const uploadedUrl = await fileUploadService.uploadFile(file, "labs")
          newUrls.push(uploadedUrl)
          
          toast({
            title: "Succès",
            description: `${file.name} uploadé avec succès`,
          })
        } catch (error: any) {
          console.error(`Erreur lors de l'upload de ${file.name}:`, error)
          toast({
            title: "Erreur d'upload",
            description: `Impossible d'uploader ${file.name}: ${error.message}`,
            variant: "destructive",
          })
        }
      }

      updateFormWithFileUrls(newUrls)
    } catch (error: any) {
      console.error("Erreur lors de l'upload des fichiers:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload des fichiers",
        variant: "destructive",
      })
    } finally {
      setUploadingFiles(false)
      // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveFile = (index: number) => {
    const newUrls = uploadedFileUrls.filter((_, i) => i !== index)
    updateFormWithFileUrls(newUrls)
    toast({
      title: "Fichier retiré",
      description: "Le fichier a été retiré de la liste",
    })
  }

  // Réinitialiser les fichiers uploadés quand le modal s'ouvre avec de nouvelles valeurs
  useEffect(() => {
    if (open && defaultValues?.uploadedFiles) {
      try {
        const urls = JSON.parse(defaultValues.uploadedFiles)
        setUploadedFileUrls(urls)
      } catch {
        setUploadedFileUrls([])
      }
    } else if (open && !defaultValues) {
      setUploadedFileUrls([])
    }
  }, [open, defaultValues])

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      resolver={zodResolver(labSchema)}
      form={form}
    >
      {() => (
        <>
          <FormField
            type="input"
            name="title"
            label="Titre du lab"
            placeholder="Introduction à Docker"
            register={form.register}
            error={form.formState.errors.title?.message}
          />
          <FormField
            type="textarea"
            name="description"
            label="Description (optionnel)"
            placeholder="Décrivez ce que ce lab permet d'apprendre..."
            register={form.register}
            rows={3}
            error={form.formState.errors.description?.message}
          />
          {/* Champ caché pour stocker les URLs des fichiers uploadés */}
          <input
            type="hidden"
            {...form.register("uploadedFiles")}
          />
          
          {/* Interface de sélection et upload de fichiers */}
          <div className="grid gap-2">
            <Label htmlFor="lab-files">Fichiers du lab (optionnel)</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFiles}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingFiles ? "Upload en cours..." : "Sélectionner des fichiers"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="lab-files"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.zip,.tar,.gz,.doc,.docx,.txt,.md,.json,.yaml,.yml,.sh,.py,.js,.html,.css"
                />
              </div>
              
              {/* Liste des fichiers uploadés */}
              {uploadedFileUrls.length > 0 && (
                <div className="mt-2 space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Fichiers uploadés ({uploadedFileUrls.length})
                  </Label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {uploadedFileUrls.map((url: string, index: number) => {
                      const fileName = url.split('/').pop() || `Fichier ${index + 1}`
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate" title={url}>
                              {fileName}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Formats acceptés : PDF, ZIP, TAR, GZ, DOC, DOCX, TXT, MD, JSON, YAML, SH, PY, JS, HTML, CSS
              </p>
            </div>
            {form.formState.errors.uploadedFiles && (
              <p className="text-sm text-destructive">
                {form.formState.errors.uploadedFiles.message}
              </p>
            )}
          </div>
          <FormField
            type="textarea"
            name="resourceLinks"
            label="Liens ressources (optionnel)"
            placeholder='Format JSON: ["https://example.com/resource1", "https://example.com/resource2"] ou laissez vide'
            register={form.register}
            rows={3}
            error={form.formState.errors.resourceLinks?.message}
          />
          <FormField
            type="number"
            name="estimatedDurationMinutes"
            label="Durée estimée (minutes)"
            placeholder="60"
            register={form.register}
            error={form.formState.errors.estimatedDurationMinutes?.message}
          />
          <FormField
            type="textarea"
            name="instructions"
            label="Instructions du lab"
            placeholder="Étapes pour compléter le lab..."
            register={form.register}
            rows={5}
            error={form.formState.errors.instructions?.message}
          />
          <Controller
            control={form.control}
            name="activate"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activate"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor="activate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Activer le lab
                </Label>
              </div>
            )}
          />
        </>
      )}
    </ModalForm>
  )
}
