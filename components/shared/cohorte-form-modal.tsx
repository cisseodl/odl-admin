"use client"

import { ModalForm } from "@/components/ui/modal-form"
import { FormField } from "@/components/ui/form-field"
import { cohorteSchema, type CohorteFormData } from "@/lib/validations/cohorte"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type CohorteFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultValues?: Partial<CohorteFormData>
  onSubmit: (data: CohorteFormData) => void
  submitLabel?: string
}

export function CohorteFormModal({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  submitLabel = "Enregistrer",
}: CohorteFormModalProps) {
  const form = useForm<CohorteFormData>({
    resolver: zodResolver(cohorteSchema),
    defaultValues: {
      ...defaultValues,
      // Ensure date strings are correctly parsed if coming from defaultValues (which might be locale-formatted)
      dateDebut: defaultValues?.dateDebut 
        ? new Date(defaultValues.dateDebut.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')).toISOString()
        : undefined,
      dateFin: defaultValues?.dateFin 
        ? new Date(defaultValues.dateFin.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')).toISOString()
        : undefined,
    },
  })

  return (
    <ModalForm
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      defaultValues={defaultValues}
      onSubmit={(data) => {
        const formattedData = {
          ...data,
          dateDebut: (data.dateDebut && !isNaN(new Date(data.dateDebut).getTime())) ? format(new Date(data.dateDebut), "yyyy-MM-dd'T'HH:mm:ss") : "",
          dateFin: (data.dateFin && !isNaN(new Date(data.dateFin).getTime())) ? format(new Date(data.dateFin), "yyyy-MM-dd'T'HH:mm:ss") : "",
        };
        onSubmit(formattedData);
      }}
      submitLabel={submitLabel}
      resolver={zodResolver(cohorteSchema)}
    >
      {(formInstance) => (
        <>
          <FormField
            type="input"
            name="nom"
            label="Nom de la cohorte"
            placeholder="Cohorte A"
            register={formInstance.register}
            error={formInstance.formState.errors.nom?.message}
          />
          <FormField
            type="textarea"
            name="description"
            label="Description (optionnel)"
            placeholder="Description de la cohorte..."
            register={formInstance.register}
            rows={3}
            error={formInstance.formState.errors.description?.message}
          />
          <FormField
            type="custom" // Custom type for date picker
            name="dateDebut"
            label="Date de début"
            control={formInstance.control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value && !isNaN(new Date(field.value).getTime()) ? format(new Date(field.value), "PPP") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            error={formInstance.formState.errors.dateDebut?.message}
          />
          <FormField
            type="custom" // Custom type for date picker
            name="dateFin"
            label="Date de fin"
            control={formInstance.control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value && !isNaN(new Date(field.value).getTime()) ? format(new Date(field.value), "PPP") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            error={formInstance.formState.errors.dateFin?.message}
          />
        </>
      )}
    </ModalForm>
  )
}