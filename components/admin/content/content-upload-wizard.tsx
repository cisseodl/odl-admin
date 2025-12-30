"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Video,
  FileText,
  Image,
  FileQuestion,
  File,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Play,
  Clock,
  HardDrive,
  AlertCircle,
  FileCheck,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contentSchema, type ContentFormData } from "@/lib/validations/content"

type ContentUploadWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: ContentFormData & { file?: File }) => void
}

type Step = "select" | "upload" | "details" | "review"

export function ContentUploadWizard({ open, onOpenChange, onComplete }: ContentUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("select")
  const [selectedType, setSelectedType] = useState<ContentFormData["type"] | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      status: "Brouillon",
    },
  })

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "select", label: "Type de contenu", icon: <FileCheck className="h-4 w-4" /> },
    { id: "upload", label: "Upload", icon: <Upload className="h-4 w-4" /> },
    { id: "details", label: "Détails", icon: <FileText className="h-4 w-4" /> },
    { id: "review", label: "Vérification", icon: <Check className="h-4 w-4" /> },
  ]

  const contentTypes = [
    {
      type: "Vidéo" as const,
      icon: <Video className="h-8 w-8" />,
      label: "Vidéo",
      description: "MP4, MOV, AVI (max 2GB)",
      color: "text-destructive",
      bgColor: "bg-destructive/10 dark:bg-destructive/20",
    },
    {
      type: "Document" as const,
      icon: <FileText className="h-8 w-8" />,
      label: "Document",
      description: "PDF, DOCX, PPTX (max 100MB)",
      color: "text-primary",
      bgColor: "bg-primary/10 dark:bg-primary/20",
    },
    {
      type: "Image" as const,
      icon: <Image className="h-8 w-8" />,
      label: "Image",
      description: "JPG, PNG, GIF (max 50MB)",
      color: "text-[hsl(var(--success))]",
      bgColor: "bg-[hsl(var(--success))]/10 dark:bg-[hsl(var(--success))]/20",
    },
    {
      type: "Quiz" as const,
      icon: <FileQuestion className="h-8 w-8" />,
      label: "Quiz",
      description: "Créer un quiz interactif",
      color: "text-primary",
      bgColor: "bg-primary/10 dark:bg-primary/20",
    },
    {
      type: "Fichier" as const,
      icon: <File className="h-8 w-8" />,
      label: "Fichier",
      description: "ZIP, RAR, autres formats",
      color: "text-[hsl(var(--warning))]",
      bgColor: "bg-[hsl(var(--warning))]/10 dark:bg-[hsl(var(--warning))]/20",
    },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Simuler l'upload
      setIsUploading(true)
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            return 100
          }
          return prev + 10
        })
      }, 200)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setIsUploading(true)
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            return 100
          }
          return prev + 10
        })
      }, 200)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getFileDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.onloadedmetadata = () => {
          const duration = video.duration
          const minutes = Math.floor(duration / 60)
          const seconds = Math.floor(duration % 60)
          resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`)
        }
        video.src = URL.createObjectURL(file)
      } else {
        resolve("")
      }
    })
  }

  const handleNext = async () => {
    if (currentStep === "select" && selectedType) {
      setCurrentStep("upload")
      form.setValue("type", selectedType)
    } else if (currentStep === "upload" && selectedFile) {
      if (selectedType === "Vidéo") {
        const duration = await getFileDuration(selectedFile)
        form.setValue("duration", duration)
      }
      form.setValue("size", formatFileSize(selectedFile.size))
      setCurrentStep("details")
    } else if (currentStep === "details") {
      const isValid = await form.trigger()
      if (isValid) {
        setCurrentStep("review")
      }
    }
  }

  const handleBack = () => {
    if (currentStep === "upload") {
      setCurrentStep("select")
    } else if (currentStep === "details") {
      setCurrentStep("upload")
    } else if (currentStep === "review") {
      setCurrentStep("details")
    }
  }

  const handleSubmit = () => {
    const data = form.getValues()
    onComplete({ ...data, file: selectedFile || undefined })
    handleReset()
  }

  const handleReset = () => {
    setCurrentStep("select")
    setSelectedType(null)
    setSelectedFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    form.reset()
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Ajouter du contenu</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index <= currentStepIndex
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  {index < currentStepIndex ? <Check className="h-5 w-5" /> : step.icon}
                </div>
                <span className="text-xs mt-2 text-center hidden sm:block">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Step Content */}
        <div className="mt-6 min-h-[400px]">
          {/* Step 1: Select Type */}
          {currentStep === "select" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sélectionnez le type de contenu</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Choisissez le type de contenu que vous souhaitez ajouter à votre formation
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTypes.map((type) => (
                  <Card
                    key={type.type}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedType === type.type ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedType(type.type)}
                  >
                    <CardContent className="p-6">
                      <div className={`${type.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                        <div className={type.color}>{type.icon}</div>
                      </div>
                      <h4 className="font-semibold mb-1">{type.label}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Upload */}
          {currentStep === "upload" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Téléversez votre fichier</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Glissez-déposez votre fichier ou cliquez pour sélectionner
                </p>
              </div>

              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={
                      selectedType === "Vidéo"
                        ? "video/*"
                        : selectedType === "Image"
                          ? "image/*"
                          : selectedType === "Document"
                            ? ".pdf,.doc,.docx,.ppt,.pptx"
                            : "*"
                    }
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Glissez-déposez votre fichier ici</p>
                    <p className="text-sm text-muted-foreground mb-4">ou</p>
                    <Button type="button" variant="outline">
                      Parcourir les fichiers
                    </Button>
                  </label>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        {selectedType === "Vidéo" ? (
                          <Video className="h-8 w-8" />
                        ) : selectedType === "Image" ? (
                          <Image className="h-8 w-8" />
                        ) : (
                          <File className="h-8 w-8" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{selectedFile.name}</h4>
                            <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null)
                              setUploadProgress(0)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {isUploading && (
                          <div className="space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground">{uploadProgress}% téléversé</p>
                          </div>
                        )}
                        {!isUploading && uploadProgress === 100 && (
                          <div className="flex items-center gap-2 text-sm text-[hsl(var(--success))]">
                            <Check className="h-4 w-4" />
                            <span>Téléversement terminé</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedType === "Quiz" && (
                <Card className="bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Création de quiz
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vous pourrez créer votre quiz après avoir ajouté les détails de base.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === "details" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informations du contenu</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Remplissez les détails de votre contenu pour une meilleure organisation
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du contenu *</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Introduction à React Hooks"
                    className={form.formState.errors.title ? "border-destructive" : ""}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Formation *</Label>
                    <Input
                      id="course"
                      {...form.register("course")}
                      placeholder="Formation React Avancé"
                      className={form.formState.errors.course ? "border-destructive" : ""}
                    />
                    {form.formState.errors.course && (
                      <p className="text-sm text-destructive">{form.formState.errors.course.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module">Module (optionnel)</Label>
                    <Input
                      id="module"
                      {...form.register("module")}
                      placeholder="Module 1: Introduction"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée</Label>
                    <Input
                      id="duration"
                      {...form.register("duration")}
                      placeholder="15:30"
                      disabled={!!form.watch("duration")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Taille</Label>
                    <Input
                      id="size"
                      {...form.register("size")}
                      placeholder="125 MB"
                      disabled={!!form.watch("size")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut *</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => form.setValue("status", value as "Publié" | "Brouillon")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brouillon">Brouillon</SelectItem>
                      <SelectItem value="Publié">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Vérification</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Vérifiez les informations avant de finaliser l'ajout
                </p>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold mb-1">{form.watch("title")}</h4>
                      <Badge variant="outline">{form.watch("type")}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Formation</p>
                      <p className="font-medium">{form.watch("course")}</p>
                    </div>
                    {form.watch("module") && (
                      <div>
                        <p className="text-muted-foreground mb-1">Module</p>
                        <p className="font-medium">{form.watch("module")}</p>
                      </div>
                    )}
                    {form.watch("duration") && (
                      <div>
                        <p className="text-muted-foreground mb-1">Durée</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {form.watch("duration")}
                        </p>
                      </div>
                    )}
                    {form.watch("size") && (
                      <div>
                        <p className="text-muted-foreground mb-1">Taille</p>
                        <p className="font-medium flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          {form.watch("size")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground mb-1">Statut</p>
                      <Badge>{form.watch("status")}</Badge>
                    </div>
                  </div>

                  {selectedFile && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground mb-1">Fichier</p>
                        <p className="font-medium">{selectedFile.name}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Separator className="mt-6" />

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={currentStep === "select" ? handleClose : handleBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === "select" ? "Annuler" : "Précédent"}
          </Button>
          <Button
            onClick={currentStep === "review" ? handleSubmit : handleNext}
            disabled={
              (currentStep === "select" && !selectedType) ||
              (currentStep === "upload" && (!selectedFile || isUploading)) ||
              (currentStep === "review" && !form.formState.isValid)
            }
          >
            {currentStep === "review" ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Finaliser
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

