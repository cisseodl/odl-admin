"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UseFormReturn } from "react-hook-form"
import type { Step4SettingsData } from "@/lib/validations/course-builder"
import { Settings, MessageSquare, Download, Award } from "lucide-react"

type Step4SettingsProps = {
  form: UseFormReturn<Step4SettingsData>
}

export function Step4Settings({ form }: Step4SettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Paramètres de la formation</h3>
        <p className="text-sm text-muted-foreground">
          Configurez les options et permissions de votre formation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Statut de publication
          </CardTitle>
          <CardDescription>Choisissez le statut initial de votre formation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="status">Statut *</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as Step4SettingsData["status"])}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brouillon">Brouillon - Visible uniquement par vous</SelectItem>
                <SelectItem value="En révision">En révision - En attente de validation</SelectItem>
                <SelectItem value="Publié">Publié - Visible par tous les apprenants</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Interactions
          </CardTitle>
          <CardDescription>Contrôlez comment les apprenants peuvent interagir avec la formation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autoriser les commentaires</Label>
              <p className="text-sm text-muted-foreground">
                Les apprenants pourront commenter et poser des questions
              </p>
            </div>
            <Switch
              checked={form.watch("allowComments")}
              onCheckedChange={(checked) => form.setValue("allowComments", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Ressources téléchargeables
          </CardTitle>
          <CardDescription>Autorisez le téléchargement des ressources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autoriser les téléchargements</Label>
              <p className="text-sm text-muted-foreground">
                Les apprenants pourront télécharger les documents et ressources
              </p>
            </div>
            <Switch
              checked={form.watch("allowDownloads")}
              onCheckedChange={(checked) => form.setValue("allowDownloads", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certification
          </CardTitle>
          <CardDescription>Génération automatique de certificats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer les certificats</Label>
              <p className="text-sm text-muted-foreground">
                Un certificat sera généré automatiquement à la complétion de la formation
              </p>
            </div>
            <Switch
              checked={form.watch("certificateEnabled")}
              onCheckedChange={(checked) => form.setValue("certificateEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

