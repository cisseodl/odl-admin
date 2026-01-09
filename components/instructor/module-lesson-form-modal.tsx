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
import { PlusCircle, MinusCircle } from "lucide-react"; // Import icons

export enum LessonType {
  VIDEO = "VIDEO",
  QUIZ = "QUIZ",
  DOCUMENT = "DOCUMENT",
}

const lessonSchema = z.object({
  title: z.string().min(2, "Le titre de la leçon doit contenir au moins 2 caractères."),
  lessonOrder: z.number({ required_error: "L'ordre de la leçon est requis." }).min(1, "L'ordre de la leçon doit être au moins 1."),
  type: z.nativeEnum(LessonType, { required_error: "Le type de leçon est requis." }),
  contentUrl: z.string().optional(),
  duration: z.number().optional(), // in seconds
  quizId: z.number().optional(), // For QUIZ type lessons
});

const moduleFormSchema = z.object({
  courseId: z.number({ required_error: "Veuillez sélectionner un cours." }),
  title: z.string().min(2, "Le titre du module doit contenir au moins 2 caractères."),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto flex-1 pr-2">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cours</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un cours" />
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
                  <FormLabel>Titre du module</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduction au module" {...field} />
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
                  <FormLabel>Ordre du module</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border p-4 rounded-md">
              <h3 className="text-lg font-semibold">Leçons du module</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 border-t pt-4">
                  <h4 className="text-md font-medium">Leçon #{index + 1}</h4>
                  <FormField
                    control={form.control}
                    name={`lessons.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de la leçon</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduction à la leçon" {...field} />
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
                        <FormLabel>Ordre de la leçon</FormLabel>
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
                        <FormLabel>Type de leçon</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={LessonType.VIDEO}>Vidéo</SelectItem>
                            <SelectItem value={LessonType.DOCUMENT}>Document</SelectItem>
                            <SelectItem value={LessonType.QUIZ}>Quiz</SelectItem>
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
                        name={`lessons.${index}.contentUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL du contenu (Vidéo)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/video.mp4" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée (secondes)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="300" {...field} onChange={event => field.onChange(Number(event.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  {form.watch(`lessons.${index}.type`) === LessonType.DOCUMENT && (
                    <FormField
                      control={form.control}
                      name={`lessons.${index}.contentUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL du contenu (Document)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/document.pdf" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
                    <MinusCircle className="h-4 w-4 mr-2" /> Supprimer la leçon
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ title: "", lessonOrder: fields.length + 1, type: LessonType.VIDEO, contentUrl: "", duration: 0 })}>
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
