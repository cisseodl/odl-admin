// components/admin/settings/site-configuration-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { configurationService } from "@/services/configuration.service";
import { Configuration } from "@/models/configuration.model";
import { Image, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";

// Define the Zod schema for the form
export const siteConfigFormSchema = z.object({
  homepageText: z.string().min(1, "Le texte de la page d'accueil est requis.").optional(),
  homepageImageFile: z.any()
    .refine((file) => !file || (file instanceof File && file.type.startsWith("image/")), "Le fichier doit être une image.")
    .optional(),
  loginImageFile: z.any()
    .refine((file) => !file || (file instanceof File && file.type.startsWith("image/")), "Le fichier doit être une image.")
    .optional(),
  aboutText: z.string().min(1, "Le texte 'À propos de nous' est requis.").optional(),
  aboutImageFile: z.any()
    .refine((file) => !file || (file instanceof File && file.type.startsWith("image/")), "Le fichier doit être une image.")
    .optional(),
  
  // Existing image URLs for display, not part of submission payload
  homepageImageUrl: z.string().optional(),
  loginImageUrl: z.string().optional(),
  aboutImageUrl: z.string().optional(),
});

export type SiteConfigFormData = z.infer<typeof siteConfigFormSchema>;

export function SiteConfigurationForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<SiteConfigFormData>({
    resolver: zodResolver(siteConfigFormSchema),
    defaultValues: {
      homepageText: "",
      aboutText: "",
    },
  });

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const response = await configurationService.getConfiguration();
      if (response) { // Condition changed: service already unwraps .data
        form.reset({
          homepageText: response.homepageText || "",
          homepageImageUrl: response.homepageImageUrl || "",
          loginImageUrl: response.loginImageUrl || "",
          aboutText: response.aboutText || "",
          aboutImageUrl: response.aboutImageUrl || "",
        });
      } else {
        console.error("Unexpected configuration response structure: response is null or undefined");
        toast({
          title: "Erreur de données",
          description: "La réponse de l'API pour la configuration est vide.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch configuration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration du site.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const onSubmit = async (data: SiteConfigFormData) => {
    try {
      const configData: Partial<Configuration> = {
        homepageText: data.homepageText,
        aboutText: data.aboutText,
      };

      await configurationService.updateConfiguration(
        configData,
        data.homepageImageFile,
        data.loginImageFile,
        data.aboutImageFile
      );

      toast({
        title: "Succès",
        description: "La configuration du site a été mise à jour.",
      });
      fetchConfiguration(); // Re-fetch to update displayed image URLs
    } catch (error) {
      console.error("Failed to update configuration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration du site.",
        variant: "destructive",
      });
    }
  };

  const homepageImageFileRef = form.register("homepageImageFile");
  const loginImageFileRef = form.register("loginImageFile");
  const aboutImageFileRef = form.register("aboutImageFile");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuration Générale du Site
        </CardTitle>
        <CardDescription>
          Mettez à jour les paramètres généraux et les images de votre plateforme.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PageLoader />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="homepageText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texte de la Page d'Accueil</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bienvenue sur notre plateforme !" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="homepageImageFile"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Image de la Page d'Accueil</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) => onChange(event.target.files && event.target.files[0])}
                        className={form.formState.errors.homepageImageFile ? "border-destructive" : ""}
                      />
                    </FormControl>
                    {form.formState.errors.homepageImageFile && (
                      <FormMessage>{form.formState.errors.homepageImageFile.message as string}</FormMessage>
                    )}
                    {form.watch("homepageImageUrl") && (
                      <div className="mt-2 flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Image actuelle : {form.watch("homepageImageUrl")?.split('/').pop()}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.watch("homepageImageUrl")} alt="Current Homepage" className="h-10 w-10 object-cover rounded-md" />
                      </div>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="loginImageFile"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Image de la Page de Connexion</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) => onChange(event.target.files && event.target.files[0])}
                        className={form.formState.errors.loginImageFile ? "border-destructive" : ""}
                      />
                    </FormControl>
                    {form.formState.errors.loginImageFile && (
                      <FormMessage>{form.formState.errors.loginImageFile.message as string}</FormMessage>
                    )}
                    {form.watch("loginImageUrl") && (
                      <div className="mt-2 flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Image actuelle : {form.watch("loginImageUrl")?.split('/').pop()}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.watch("loginImageUrl")} alt="Current Login" className="h-10 w-10 object-cover rounded-md" />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aboutText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texte "À propos de nous"</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Notre histoire..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="aboutImageFile"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Image "À propos de nous"</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        onChange={(event) => onChange(event.target.files && event.target.files[0])}
                        className={form.formState.errors.aboutImageFile ? "border-destructive" : ""}
                      />
                    </FormControl>
                    {form.formState.errors.aboutImageFile && (
                      <FormMessage>{form.formState.errors.aboutImageFile.message as string}</FormMessage>
                    )}
                    {form.watch("aboutImageUrl") && (
                      <div className="mt-2 flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Image actuelle : {form.watch("aboutImageUrl")?.split('/').pop()}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.watch("aboutImageUrl")} alt="Current About" className="h-10 w-10 object-cover rounded-md" />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {form.formState.isSubmitting ? "Sauvegarde..." : "Enregistrer la Configuration"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
