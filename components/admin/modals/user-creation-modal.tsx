// components/admin/modals/user-creation-modal.tsx
"use client";

import { useEffect, useState } from "react";
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
import { authService } from "@/services/auth.service"; // Assuming authService handles signup
import { useToast } from "@/hooks/use-toast";

// Define the Zod schema for user creation
// Le mot de passe est optionnel (pour permettre la création par admin sans mot de passe)
export const userCreationSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis."),
  email: z.string().email("L'email doit être valide.").min(1, "L'email est requis."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères.").optional(),
  phone: z.string().optional(),
  // avatarFile: z.any() // Optional: if avatar upload is part of signup
  //   .refine((file) => !file || (file instanceof File && file.type.startsWith("image/")), "Le fichier doit être une image.")
  //   .optional(),
});

export type UserCreationFormData = z.infer<typeof userCreationSchema>;

type UserCreationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: (user: { id: number; fullName: string; email: string }) => void; // Callback after successful creation
  title: string;
  description: string;
  submitLabel: string;
  hidePassword?: boolean; // Option pour masquer le champ mot de passe (pour les formateurs créés par admin)
};

export function UserCreationModal({
  open,
  onOpenChange,
  onUserCreated,
  title,
  description,
  submitLabel,
  hidePassword = false,
}: UserCreationModalProps) {
  const { toast } = useToast();
  const form = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: UserCreationFormData) => {
    try {
      // S'assurer que les champs requis sont bien remplis
      if (!data.fullName || !data.fullName.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom complet est requis.",
          variant: "destructive",
        });
        return;
      }
      if (!data.email || !data.email.trim()) {
        toast({
          title: "Erreur",
          description: "L'email est requis.",
          variant: "destructive",
        });
        return;
      }
      // Le mot de passe est optionnel si hidePassword est true (pour les formateurs créés par admin)
      if (!hidePassword && (!data.password || data.password.length < 6)) {
        toast({
          title: "Erreur",
          description: "Le mot de passe doit contenir au moins 6 caractères.",
          variant: "destructive",
        });
        return;
      }

      const newUser: any = {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined, // Phone est optionnel
      };
      
      // Inclure le mot de passe seulement s'il est fourni et que hidePassword est false
      if (!hidePassword && data.password && data.password.trim().length > 0) {
        newUser.password = data.password;
      }
      
      console.log("Creating user with data:", { ...newUser, password: "***" }); // Log sans le mot de passe

      // authService.signUp retourne CResponse<JwtAuthenticationResponse>
      // Structure: { ok: boolean, data: { token: string, user: User }, message: string }
      const response = await authService.signUp(newUser, undefined);
      
      // Vérifier si le message indique un succès (même si ok n'est pas true)
      const message = response?.message || "";
      const isSuccessMessage = message.toLowerCase().includes("réussi") || 
                               message.toLowerCase().includes("succès") ||
                               message.toLowerCase().includes("créé");
      
      // Vérifier la structure de la réponse
      const isOk = response?.ok === true || response?.ok === "true" || isSuccessMessage;
      
      if (isOk && response?.data) {
        const jwtResponse = response.data;
        // JwtAuthenticationResponse contient { token, user }
        const createdUser = jwtResponse?.user || jwtResponse;
        
        if (createdUser && createdUser.id) {
          toast({
            title: "Succès",
            description: message || `L'utilisateur ${createdUser.fullName || data.fullName} a été créé avec succès.`,
          });
          onUserCreated?.({
            id: createdUser.id,
            fullName: createdUser.fullName || data.fullName,
            email: createdUser.email || data.email,
          });
          onOpenChange(false);
          return; // Sortir de la fonction après succès
        }
      }
      
      // Si on arrive ici, essayer d'extraire l'utilisateur depuis différentes structures possibles
      const userFromResponse = response?.data?.user || response?.user || response?.data;
      if (userFromResponse && userFromResponse.id && isSuccessMessage) {
        toast({
          title: "Succès",
          description: message || `L'utilisateur a été créé avec succès.`,
        });
        onUserCreated?.({
          id: userFromResponse.id,
          fullName: userFromResponse.fullName || data.fullName,
          email: userFromResponse.email || data.email,
        });
        onOpenChange(false);
        return;
      }
      
      // Si c'est un message d'erreur, le lancer
      if (response && response.message && !isSuccessMessage) {
        throw new Error(response.message);
      }
      
      throw new Error("Erreur inattendue lors de la création de l'utilisateur.");
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage = error.message || "Impossible de créer l'utilisateur.";
      const isSuccessMessage = errorMessage.toLowerCase().includes("réussi") || 
                               errorMessage.toLowerCase().includes("succès") ||
                               errorMessage.toLowerCase().includes("créé");
      
      // Si c'est un message de succès dans l'erreur, ne pas l'afficher comme erreur
      if (isSuccessMessage) {
        // Le backend a retourné un succès mais la structure n'est pas celle attendue
        // On ne peut pas extraire l'utilisateur, donc on affiche juste un message générique
        toast({
          title: "Succès",
          description: "L'utilisateur a été créé avec succès. Veuillez rafraîchir la liste.",
        });
        onOpenChange(false);
        return;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom Complet</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Amadou Traoré" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {!hidePassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="********" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0612345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Optional: avatar upload field */}
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
