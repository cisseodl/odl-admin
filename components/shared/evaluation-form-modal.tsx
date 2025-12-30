// components/shared/evaluation-form-modal.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { evaluationFormSchema, type EvaluationFormData } from "@/lib/validations/evaluation" // Assuming this validation exists
import { Save, Upload } from "lucide-react"
import { useState } from "react"

type EvaluationFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: EvaluationFormData
  onSubmit: (data: EvaluationFormData & { file?: File }) => void
  submitLabel: string
}

export function EvaluationFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel,
}: EvaluationFormModalProps) {
  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      status: "Draft",
    },
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (data: EvaluationFormData) => {
    onSubmit({ ...data, file: selectedFile });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de l'évaluation" {...field} />
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
                    <Textarea placeholder="Description de l'évaluation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">Brouillon</SelectItem>
                      <SelectItem value="Active">Actif</SelectItem>
                      <SelectItem value="Archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="subjectFile">Sujet de l'évaluation (fichier)</Label>
              <Input
                id="subjectFile"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              />
              {selectedFile && <p className="text-sm text-muted-foreground">Fichier sélectionné: {selectedFile.name}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
