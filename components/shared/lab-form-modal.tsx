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
  const [labType, setLabType] = useState<"file" | "link" | "instructions">("instructions")
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

  // Initialiser le formulaire avec les valeurs par défaut
  const formDefaults: Partial<LabFormData> = {
    labType: defaultValues?.uploadedFiles && defaultValues.uploadedFiles !== "" && defaultValues.uploadedFiles !== "[]" 
      ? "file" 
      : defaultValues?.resourceLinks && defaultValues.resourceLinks !== "" && defaultValues.resourceLinks !== "[]"
      ? "link"
      : "instructions",
    activate: true,
    estimatedDurationMinutes: defaultValues?.estimatedDurationMinutes || 60,
    maxDurationMinutes: defaultValues?.maxDurationMinutes || 90,
    ...defaultValues,
  }

  // Réinitialiser les fichiers uploadés quand le modal s'ouvre avec de nouvelles valeurs
  useEffect(() => {
    if (open && defaultValues) {
      // Déterminer le type de lab
      if (defaultValues.uploadedFiles && defaultValues.uploadedFiles !== "" && defaultValues.uploadedFiles !== "[]") {
        setLabType("file")
        try {
          const urls = JSON.parse(defaultValues.uploadedFiles)
          setUploadedFileUrls(urls)
        } catch {
          setUploadedFileUrls([])
        }
      } else if (defaultValues.resourceLinks && defaultValues.resourceLinks !== "" && defaultValues.resourceLinks !== "[]") {
        setLabType("link")
      } else {
        setLabType("instructions")
      }
    } else if (open && !defaultValues) {
      setUploadedFileUrls([])
      setLabType("instructions")
    }
  }, [open, defaultValues])

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      onSubmit={(data) => {
        console.log("LabFormModal onSubmit called with data:", data)
        try {
          onSubmit(data)
        } catch (error) {
          console.error("Error in onSubmit handler:", error)
        }
      }}
      submitLabel={submitLabel}
      resolver={zodResolver(labSchema)}
      defaultValues={formDefaults}
    >
      {(form) => {
        // Synchroniser le form externe avec le form interne
        const currentLabType = form.watch("labType") || labType
        
        // S'assurer que labType est bien défini dans le form au chargement
        useEffect(() => {
          const formLabType = form.getValues("labType")
          if (!formLabType || formLabType !== labType) {
            form.setValue("labType", labType, { shouldValidate: true })
          }
        }, [open, labType])
        
        // S'assurer que labType est toujours synchronisé
        useEffect(() => {
          form.setValue("labType", labType, { shouldValidate: true })
        }, [labType])
        
        // Fonction pour mettre à jour les URLs de fichiers dans le form
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
        
        return (
          <>
            <FormField
              type="input"
              name="title"
              label="Titre du lab *"
              placeholder="Introduction à Docker"
              register={form.register}
              error={form.formState.errors.title?.message}
            />
            <FormField
              type="textarea"
              name="description"
              label="Description *"
              placeholder="Décrivez ce que ce lab permet d'apprendre..."
              register={form.register}
              rows={3}
              error={form.formState.errors.description?.message}
            />
            
            {/* Choix du type de lab */}
            <div className="grid gap-2">
              <Label>Type de contenu du lab *</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="lab-type-file"
                    value="file"
                    checked={currentLabType === "file"}
                    onChange={(e) => {
                      const newType = "file" as const
                      setLabType(newType)
                      form.setValue("labType", newType, { shouldValidate: true })
                      // Réinitialiser les autres champs conditionnels
                      form.setValue("resourceLinks", "")
                      form.setValue("instructions", "")
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="lab-type-file" className="font-normal cursor-pointer">
                    Fichier (upload depuis l'ordinateur)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="lab-type-link"
                    value="link"
                    checked={currentLabType === "link"}
                    onChange={(e) => {
                      const newType = "link" as const
                      setLabType(newType)
                      form.setValue("labType", newType, { shouldValidate: true })
                      // Réinitialiser les autres champs conditionnels
                      form.setValue("uploadedFiles", "")
                      form.setValue("instructions", "")
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="lab-type-link" className="font-normal cursor-pointer">
                    Lien ressource (URL externe)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="lab-type-instructions"
                    value="instructions"
                    checked={currentLabType === "instructions"}
                    onChange={(e) => {
                      const newType = "instructions" as const
                      setLabType(newType)
                      form.setValue("labType", newType, { shouldValidate: true })
                      // Réinitialiser les autres champs conditionnels
                      form.setValue("uploadedFiles", "")
                      form.setValue("resourceLinks", "")
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="lab-type-instructions" className="font-normal cursor-pointer">
                    Instructions complètes (texte détaillé)
                  </Label>
                </div>
              </div>
              {form.formState.errors.labType && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.labType.message}
                </p>
              )}
            </div>
            
            <input type="hidden" {...form.register("labType")} />
          {/* Champ caché pour stocker les URLs des fichiers uploadés */}
          <input
            type="hidden"
            {...form.register("uploadedFiles")}
          />
          
          {/* Interface de sélection et upload de fichiers - Affiché seulement si type = "file" */}
          {currentLabType === "file" && (
            <div className="grid gap-2">
              <Label htmlFor="lab-files">Fichiers du lab *</Label>
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
          )}
          
          {/* Liens ressources - Affiché seulement si type = "link" */}
          {currentLabType === "link" && (
            <FormField
              type="textarea"
              name="resourceLinks"
              label="Liens ressources *"
              placeholder='Format JSON: ["https://example.com/resource1", "https://example.com/resource2"]'
              register={form.register}
              rows={3}
              error={form.formState.errors.resourceLinks?.message}
            />
          )}
          
          {/* Instructions - Affiché seulement si type = "instructions" */}
          {currentLabType === "instructions" && (
            <FormField
              type="textarea"
              name="instructions"
              label="Instructions complètes du lab *"
              placeholder="Étapes détaillées pour compléter le lab..."
              register={form.register}
              rows={8}
              error={form.formState.errors.instructions?.message}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              type="number"
              name="estimatedDurationMinutes"
              label="Durée estimée (minutes) *"
              placeholder="60"
              register={form.register}
              error={form.formState.errors.estimatedDurationMinutes?.message}
            />
            <FormField
              type="number"
              name="maxDurationMinutes"
              label="Durée maximale (minutes) *"
              placeholder="90"
              register={form.register}
              error={form.formState.errors.maxDurationMinutes?.message}
            />
          </div>
          <p className="text-xs text-muted-foreground break-words">
            Le lab s'arrêtera automatiquement à la fin de cette durée.
          </p>
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
        )
      }}
    </ModalForm>
  )
}
