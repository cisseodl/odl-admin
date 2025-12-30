"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { certificationSchema, type CertificationFormData } from "@/lib/validations/certification"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type CertificationFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<CertificationFormData>
  onSubmit: (data: CertificationFormData) => void
  submitLabel?: string
}

export function CertificationFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: CertificationFormModalProps) {
  const form = useForm<CertificationFormData & { validUntilDate?: Date }>({
    resolver: zodResolver(certificationSchema),
    defaultValues,
  })

  const handleSubmit = form.handleSubmit((data) => {
    const { validUntilDate, ...certData } = data
    const formattedData: CertificationFormData = {
      ...certData,
      validUntil: validUntilDate ? format(validUntilDate, "dd MMM yyyy") : (data.validUntil || ""),
    }
    onSubmit(formattedData)
    form.reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <FormField
              type="input"
              name="name"
              label="Nom de la certification"
              placeholder="Certification React Avancé"
              register={form.register}
              error={form.formState.errors.name?.message}
            />
            <FormField
              type="input"
              name="course"
              label="Formation associée"
              placeholder="Formation React Avancé"
              register={form.register}
              error={form.formState.errors.course?.message}
            />
            <div className="grid gap-2">
              <label className="text-sm font-medium">Validité jusqu'au</label>
              <Controller
                name="validUntilDate"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <FormField
              type="select"
              name="status"
              label="Statut"
              control={form.control}
              options={[
                { value: "Actif", label: "Actif" },
                { value: "Expiré", label: "Expiré" },
                { value: "En attente", label: "En attente" },
              ]}
              error={form.formState.errors.status?.message}
            />
            <FormField
              type="textarea"
              name="requirements"
              label="Exigences"
              placeholder="80% de réussite minimum"
              register={form.register}
              rows={3}
              error={form.formState.errors.requirements?.message}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Enregistrement..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

