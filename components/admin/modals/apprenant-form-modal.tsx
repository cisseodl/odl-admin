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
import { useLanguage } from "@/contexts/language-context";

// Define the Zod schema for apprenant profile fields
export const apprenantProfileSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis."),
  numero: z.string().optional(),
  profession: z.string().optional(),
  niveauEtude: z.string().optional(),
  filiere: z.string().optional(),
  attentes: z.string().optional(),
  satisfaction: z.boolean().optional(),
  cohorteId: z.coerce.number().optional(), // Optionnel, pas de validation min
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
  const { t } = useLanguage();
  const form = useForm<ApprenantProfileFormData>({
    resolver: zodResolver(apprenantProfileSchema),
    defaultValues: {
      username: defaultValues?.username || "",
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
        username: "", numero: "", profession: "", niveauEtude: "",
        filiere: "", attentes: "", satisfaction: false, cohorteId: undefined
      });
    } else if (defaultValues) {
      form.reset({
        username: defaultValues.username || "",
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
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('users.learners.modals.form.username') || "Nom d'utilisateur"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('users.learners.modals.form.username_placeholder') || "amadou.traore"} />
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
                  <FormLabel>{t('users.learners.modals.form.numero') || "Numéro de téléphone (optionnel)"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('users.learners.modals.form.numero_placeholder') || "0612345678"} />
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
                  <FormLabel>{t('users.learners.modals.form.profession') || "Profession (optionnel)"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('users.learners.modals.form.profession_placeholder') || "Développeur Junior"} />
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
                  <FormLabel>{t('users.learners.modals.form.niveau_etude') || "Niveau d'étude (optionnel)"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('users.learners.modals.form.niveau_etude_placeholder') || "Licence, Master..."} />
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
                  <FormLabel>{t('users.learners.modals.form.filiere') || "Filière (optionnel)"}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('users.learners.modals.form.filiere_placeholder') || "Informatique, Marketing..."} />
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
                  <FormLabel>{t('users.learners.modals.form.attentes') || "Attentes (optionnel)"}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('users.learners.modals.form.attentes_placeholder') || "Décrivez vos attentes..."} rows={3} />
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
                  <FormLabel>{t('users.learners.modals.form.cohorte') || "Cohorte (optionnel)"}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} value={field.value ? String(field.value) : ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('users.learners.modals.form.cohorte_placeholder') || "Sélectionner une cohorte (optionnel)"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">{t('users.learners.modals.form.cohorte_none') || "Aucune cohorte"}</SelectItem>
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
