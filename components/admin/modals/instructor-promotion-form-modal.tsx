// components/admin/modals/instructor-promotion-form-modal.tsx
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

// Define the Zod schema for instructor profile fields
export const instructorProfileSchema = z.object({
  biography: z.string().optional(),
  specialization: z.string().optional(),
});

export type InstructorProfileFormData = z.infer<typeof instructorProfileSchema>;

type InstructorPromotionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InstructorProfileFormData & { userId: number }) => void;
  title: string;
  description: string;
  submitLabel: string;
  userId: number; // The ID of the user being promoted
  defaultValues?: Partial<InstructorProfileFormData>;
};

export function InstructorPromotionFormModal({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitLabel,
  userId,
  defaultValues,
}: InstructorPromotionFormModalProps) {
  const form = useForm<InstructorProfileFormData>({
    resolver: zodResolver(instructorProfileSchema),
    defaultValues: {
      biography: defaultValues?.biography || "",
      specialization: defaultValues?.specialization || "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        biography: "",
        specialization: "",
      });
    } else if (defaultValues) {
      form.reset({
        biography: defaultValues.biography || "",
        specialization: defaultValues.specialization || "",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (data: InstructorProfileFormData) => {
    onSubmit({ ...data, userId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biographie (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Parlez de votre expérience..." rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spécialisation (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Développement Web, Cloud AWS" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
