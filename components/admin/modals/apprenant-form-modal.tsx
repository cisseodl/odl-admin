// components/admin/modals/apprenant-form-modal.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cohorte } from "@/models/cohorte.model"; // Assuming Cohorte model exists
import { apprenantService } from "@/services/apprenant.service"; // Adjust import as needed

// Define the Zod schema for apprenant profile fields
export const apprenantProfileSchema = z.object({
  nom: z.string().min(1, "Le nom est requis."),
  prenom: z.string().min(1, "Le prénom est requis."),
  email: z.string().email("L'email doit être valide.").min(1, "L'email est requis."),
  numero: z.string().optional(),
  profession: z.string().optional(),
  niveauEtude: z.string().optional(),
  filiere: z.string().optional(),
  attentes: z.string().optional(),
  satisfaction: z.boolean().optional(),
  cohorteId: z.coerce.number().min(1, "La cohorte est requise.").optional(), // Changed to coerce.number
});

export type ApprenantProfileFormData = z.infer<typeof apprenantProfileSchema>;

type ApprenantFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApprenantProfileFormData & { userId?: number }) => void;
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: Partial<ApprenantProfileFormData>;
  cohortes?: Cohorte[]; // Cohortes for dropdown, passed from parent
  userId?: number; // Optional: for when promoting an existing user
};

export function ApprenantFormModal({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitLabel,
  defaultValues,
  cohortes = [],
  userId,
}: ApprenantFormModalProps) {
  const form = useForm<ApprenantProfileFormData>({
    resolver: zodResolver(apprenantProfileSchema),
    defaultValues: {
      nom: defaultValues?.nom || "",
      prenom: defaultValues?.prenom || "",
      email: defaultValues?.email || "",
      numero: defaultValues?.numero || "",
      profession: defaultValues?.profession || "",
      niveauEtude: defaultValues?.niveauEtude || "",
      filiere: defaultValues?.filiere || "",
      attentes: defaultValues?.attentes || "",
      satisfaction: defaultValues?.satisfaction ?? false,
      cohorteId: defaultValues?.cohorteId,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        nom: "", prenom: "", email: "", numero: "", profession: "", niveauEtude: "",
        filiere: "", attentes: "", satisfaction: false, cohorteId: undefined
      });
    } else if (defaultValues) {
      form.reset({
        nom: defaultValues.nom || "",
        prenom: defaultValues.prenom || "",
        email: defaultValues.email || "",
        numero: defaultValues.numero || "",
        profession: defaultValues.profession || "",
        niveauEtude: defaultValues.niveauEtude || "",
        filiere: defaultValues.filiere || "",
        attentes: defaultValues.attentes || "",
        satisfaction: defaultValues.satisfaction ?? false,
        cohorteId: defaultValues.cohorteId,
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (data: ApprenantProfileFormData) => {
    onSubmit({ ...data, userId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Traoré" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Amadou" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="amadou.traore@example.ml" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0612345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Développeur Junior" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="niveauEtude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau d'étude (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Licence, Master..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="filiere"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filière (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Informatique, Marketing..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attentes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attentes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Décrivez vos attentes..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cohorteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cohorte</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une cohorte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cohortes.map((cohorte) => (
                        <SelectItem key={cohorte.id} value={String(cohorte.id)}>
                          {cohorte.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add more fields as needed based on Apprenant model */}
            <DialogFooter>
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
