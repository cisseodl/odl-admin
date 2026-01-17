// components/shared/rubrique-form-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rubrique } from "@/models/rubrique.model";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";


// Define the Zod schema for the form
export const rubriqueFormSchema = z.object({
  rubrique: z.string().min(1, "Le titre de la rubrique est requis."),
  description: z.string().optional(),
  objectifs: z.string().optional(),
  publicCible: z.string().optional(),
  dureeFormat: z.string().optional(),
  lienRessources: z.string().url("L'URL des ressources doit être valide.").optional().or(z.literal("")),
  imageFile: z.any() // File object for new image
    .refine((file) => !file || (file instanceof File && file.type.startsWith("image/")), "Le fichier doit être une image.")
    .optional(),
  // For editing, we might need to display the current image
  currentImage: z.string().optional(), 
});

export type RubriqueFormData = z.infer<typeof rubriqueFormSchema>;

type RubriqueFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RubriqueFormData) => void;
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: Partial<Rubrique & { currentImage?: string }>; // Allow passing current image URL for display
};

export function RubriqueFormModal({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitLabel,
  defaultValues,
}: RubriqueFormModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const form = useForm<RubriqueFormData>({
    resolver: zodResolver(rubriqueFormSchema),
    defaultValues: {
      rubrique: defaultValues?.rubrique || "",
      description: defaultValues?.description || "",
      objectifs: defaultValues?.objectifs || "",
      publicCible: defaultValues?.publicCible || "",
      dureeFormat: defaultValues?.dureeFormat || "",
      lienRessources: defaultValues?.lienRessources || "",
      currentImage: defaultValues?.image || undefined, // Pass existing image URL for display
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        rubrique: "",
        description: "",
        objectifs: "",
        publicCible: "",
        dureeFormat: "",
        lienRessources: "",
        imageFile: undefined,
        currentImage: undefined,
      });
      // If defaultValues are provided, reset with them
      if (defaultValues) {
        form.reset({
          rubrique: defaultValues.rubrique || "",
          description: defaultValues.description || "",
          objectifs: defaultValues.objectifs || "",
          publicCible: defaultValues.publicCible || "",
          dureeFormat: defaultValues.dureeFormat || "",
          lienRessources: defaultValues.lienRessources || "",
          imageFile: undefined,
          currentImage: defaultValues.image || undefined,
        });
      }
    } else if (defaultValues) {
      // If dialog opens with defaultValues, ensure form state reflects them
      form.reset({
        rubrique: defaultValues.rubrique || "",
        description: defaultValues.description || "",
        objectifs: defaultValues.objectifs || "",
        publicCible: defaultValues.publicCible || "",
        dureeFormat: defaultValues.dureeFormat || "",
        lienRessources: defaultValues.lienRessources || "",
        imageFile: undefined,
        currentImage: defaultValues.image || undefined,
      });
    }
  }, [open, defaultValues, form]);


  const fileRef = form.register("imageFile");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="px-6 space-y-4 overflow-y-auto flex-1 pb-4">
            <FormField
              control={form.control}
              name="rubrique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la Rubrique</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Développement Web" />
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
                  <FormLabel>{t('rubriques.form.description') || "Description"}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('rubriques.form.description_placeholder') || "Description détaillée..."} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="objectifs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rubriques.form.objectives') || "Objectifs"}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('rubriques.form.objectives_placeholder') || "Objectifs de la rubrique..."} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publicCible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rubriques.form.target_audience') || "Public Cible"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('rubriques.form.target_audience_placeholder') || "Ex: Développeurs débutants"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dureeFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rubriques.form.duration') || "Durée du Format"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('rubriques.form.duration_placeholder') || "Ex: 3 mois ou 40 heures"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lienRessources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien vers Ressources</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/resources" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>{t('rubriques.form.image') || "Image de la Rubrique"}</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/*"
                      onChange={(event) => onChange(event.target.files && event.target.files[0])}
                      className={form.formState.errors.imageFile ? "border-destructive" : ""}
                    />
                  </FormControl>
                  {form.formState.errors.imageFile && (
                    <FormMessage>{form.formState.errors.imageFile.message as string}</FormMessage>
                  )}
                  {form.watch("currentImage") && (
                    <div className="mt-2 flex items-center gap-2">
                      <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Image actuelle : {form.watch("currentImage")?.split('/').pop()}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.watch("currentImage")} alt="Current" className="h-20 w-auto max-w-full object-contain rounded-md" />
                    </div>
                  )}
                </FormItem>
              )}
            />
            </div>
            <DialogFooter className="px-6 pt-4 pb-6 flex-shrink-0 border-t">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Chargement..." : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}