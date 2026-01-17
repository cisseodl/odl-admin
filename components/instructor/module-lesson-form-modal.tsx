// components/instructor/module-lesson-form-modal.tsx
"use client"

import { useForm, useFieldArray } from "react-hook-form"
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
import { Course } from "@/models"
import { PlusCircle, MinusCircle, Upload, File } from "lucide-react";
import { fileUploadService } from "@/services/file-upload.service";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

export enum LessonType {
  VIDEO = "VIDEO",
  QUIZ = "QUIZ",
  DOCUMENT = "DOCUMENT",
  LAB = "LAB", // Ajout du type LAB conforme au backend
}

const lessonSchema = z.object({
  title: z.string().min(2, "Le titre de la leçon doit contenir au moins 2 caractères."),
  lessonOrder: z.number({ required_error: "L'ordre de la leçon est requis." }).min(1, "L'ordre de la leçon doit être au moins 1."),
  type: z.nativeEnum(LessonType, { required_error: "Le type de leçon est requis." }),
  contentUrl: z.string().optional(),
  contentFile: z.any().optional().refine(
    (val) => {
      if (!val) return true;
      // Vérifier les propriétés d'un objet File sans utiliser instanceof
      // Cette approche est plus robuste et fonctionne dans tous les contextes (SSR, build, runtime)
      if (typeof val !== 'object' || val === null) return false;
      
      // Vérifier les propriétés essentielles d'un objet File
      const hasName = 'name' in val && typeof val.name === 'string';
      const hasSize = 'size' in val && typeof val.size === 'number';
      const hasType = 'type' in val && typeof val.type === 'string';
      
      // Vérifier si c'est un objet File en utilisant Object.prototype.toString.call
      // Cette méthode est plus sûre que instanceof
      if (typeof window !== 'undefined') {
        try {
          const fileType = Object.prototype.toString.call(val);
          if (fileType === '[object File]') {
            return true;
          }
        } catch (e) {
          // Si Object.prototype.toString.call échoue, continuer avec la vérification des propriétés
        }
      }
      
      // Fallback: vérifier les propriétés d'un objet File
      // Si l'objet a les propriétés name, size et type, on considère que c'est un File
      return hasName && hasSize && hasType;
    },
    { message: "Le fichier doit être un objet File valide" }
  ), // Fichier à uploader
  duration: z.number().optional(), // en minutes (conforme au DTO backend LessonCreationRequest)
  quizId: z.number().optional(), // For QUIZ type lessons (non utilisé dans le DTO backend)
});

const moduleFormSchema = z.object({
  courseId: z.number({ required_error: "Veuillez sélectionner un cours." }),
  title: z.string().min(2, "Le titre du module doit contenir au moins 2 caractères."),
  description: z.string().optional(), // Conforme au DTO backend ModuleCreationRequest
  moduleOrder: z.number({ required_error: "L'ordre du module est requis." }).min(1, "L'ordre du module doit être au moins 1."),
  lessons: z.array(lessonSchema).min(1, "Au moins une leçon est requise pour le module."),
});

export type ModuleFormData = z.infer<typeof moduleFormSchema>

type ModuleLessonFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onSubmit: (data: ModuleFormData) => void
  submitLabel: string
  defaultValues?: Partial<ModuleFormData>
  courses: Course[] // To select which course to add the module to
}

export function ModuleLessonFormModal({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel,
  defaultValues,
  courses,
}: ModuleLessonFormModalProps) {
  const { t } = useLanguage();
  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      ...defaultValues,
      lessons: defaultValues?.lessons && defaultValues.lessons.length > 0 ? defaultValues.lessons : [{ title: "", lessonOrder: 1, type: LessonType.VIDEO }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lessons",
  });

  const { toast } = useToast();

  const handleSubmit = async (data: ModuleFormData) => {
    try {
      console.log("[ModuleLessonFormModal] handleSubmit appelé avec:", data);
      
      // Uploader les fichiers pour chaque lesson qui a un fichier
      console.log("[ModuleLessonFormModal] Début de l'upload des fichiers...");
      const lessonsWithUploadedFiles = await Promise.all(
        data.lessons.map(async (lesson, index) => {
          console.log(`[ModuleLessonFormModal] Traitement de la leçon ${index}:`, lesson);
          
          if (lesson.contentFile && (lesson.type === LessonType.VIDEO || lesson.type === LessonType.DOCUMENT || lesson.type === LessonType.LAB)) {
            try {
              const folderName = lesson.type === LessonType.VIDEO ? "videos" : lesson.type === LessonType.DOCUMENT ? "documents" : "labs";
              console.log(`[ModuleLessonFormModal] Upload du fichier pour la leçon ${index} dans le dossier: ${folderName}`);
              
              const uploadedUrl = await fileUploadService.uploadFile(lesson.contentFile, folderName);
              console.log(`[ModuleLessonFormModal] Fichier uploadé avec succès, URL: ${uploadedUrl}`);
              
              return {
                ...lesson,
                contentUrl: uploadedUrl,
                contentFile: undefined, // Retirer le fichier du payload final
              };
            } catch (error: any) {
              console.error(`[ModuleLessonFormModal] Erreur lors de l'upload du fichier pour la leçon ${index}:`, error);
              toast({
                title: "Erreur d'upload",
                description: `Impossible d'uploader le fichier pour la leçon "${lesson.title}": ${error.message}`,
                variant: "destructive",
              });
              throw error;
            }
          }
          console.log(`[ModuleLessonFormModal] Aucun fichier à uploader pour la leçon ${index}`);
          return {
            ...lesson,
            contentFile: undefined, // Retirer le fichier du payload final
          };
        })
      );

      console.log("[ModuleLessonFormModal] Tous les fichiers uploadés, préparation du payload final");
      const finalData = {
        ...data,
        lessons: lessonsWithUploadedFiles,
      };
      console.log("[ModuleLessonFormModal] Appel de onSubmit avec:", finalData);
      
      // Soumettre avec les URLs uploadées
      await onSubmit(finalData);
      
      console.log("[ModuleLessonFormModal] onSubmit terminé avec succès");
    } catch (error: any) {
      console.error("[ModuleLessonFormModal] Erreur dans handleSubmit:", error);
      console.error("[ModuleLessonFormModal] Message d'erreur:", error.message);
      console.error("[ModuleLessonFormModal] Stack:", error.stack);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission du formulaire.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 overflow-y-auto flex-1 pr-2">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('content.modals.form.course') || "Cours"}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('content.modals.form.course_placeholder') || "Sélectionnez un cours"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('content.modals.form.module_title') || "Titre du module"}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('content.modals.form.module_title_placeholder') || "Introduction au module"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="moduleOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('content.modals.form.module_order') || "Ordre du module"}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="text-lg font-semibold">{t('content.modals.form.lessons_title') || "Leçons du module"}</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 border-t pt-4">
                  <h4 className="text-md font-medium">{t('content.modals.form.lesson_number', { number: index + 1 }) || `Leçon #${index + 1}`}</h4>
                  <FormField
                    control={form.control}
                    name={`lessons.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('content.modals.form.lesson_title') || "Titre de la leçon"}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('content.modals.form.lesson_title_placeholder') || "Introduction à la leçon"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`lessons.${index}.lessonOrder`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('content.modals.form.lesson_order') || "Ordre de la leçon"}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`lessons.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('content.modals.form.lesson_type') || "Type de leçon"}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('content.modals.form.lesson_type_placeholder') || "Sélectionnez un type"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={LessonType.VIDEO}>{t('content.lesson_types.video') || "Vidéo"}</SelectItem>
                            <SelectItem value={LessonType.DOCUMENT}>{t('content.lesson_types.document') || "Document"}</SelectItem>
                            <SelectItem value={LessonType.QUIZ}>Quiz</SelectItem>
                            <SelectItem value={LessonType.LAB}>Lab</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch(`lessons.${index}.type`) === LessonType.VIDEO && (
                    <>
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.contentFile`}
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Fichier vidéo</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      onChange(file);
                                      // Mettre à jour aussi contentUrl pour affichage
                                      form.setValue(`lessons.${index}.contentUrl`, file.name);
                                    }
                                  }}
                                  {...field}
                                />
                                {value && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <File className="h-4 w-4" />
                                    {(value as File).name}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Téléchargez un fichier vidéo (MP4, AVI, etc.)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('content.modals.form.lesson_duration') || "Durée (minutes)"}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {form.watch(`lessons.${index}.type`) === LessonType.DOCUMENT && (
                    <>
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.contentFile`}
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>{t('content.modals.form.lesson_file') || "Fichier document"}</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.txt"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      onChange(file);
                                      form.setValue(`lessons.${index}.contentUrl`, file.name);
                                    }
                                  }}
                                  {...field}
                                />
                                {value && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <File className="h-4 w-4" />
                                    {(value as File).name}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Téléchargez un document (PDF, DOC, DOCX, TXT)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('content.modals.form.lesson_duration') || "Durée (minutes)"}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {form.watch(`lessons.${index}.type`) === LessonType.QUIZ && (
                    <FormField
                      control={form.control}
                      name={`lessons.${index}.quizId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID du Quiz</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="123" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {form.watch(`lessons.${index}.type`) === LessonType.LAB && (
                    <>
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.contentFile`}
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>{t('content.modals.form.lesson_file') || "Fichier lab"}</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept=".zip,.tar,.gz,.json"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      onChange(file);
                                      form.setValue(`lessons.${index}.contentUrl`, file.name);
                                    }
                                  }}
                                  {...field}
                                />
                                {value && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <File className="h-4 w-4" />
                                    {(value as File).name}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Téléchargez un fichier lab (ZIP, TAR, GZ, JSON)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="30" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
                    <MinusCircle className="h-4 w-4 mr-2" /> Supprimer la leçon
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ title: "", lessonOrder: fields.length + 1, type: LessonType.VIDEO })}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter une leçon
              </Button>
            </div>
            <Button type="submit">{submitLabel}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
