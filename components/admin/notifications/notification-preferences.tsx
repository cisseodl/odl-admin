"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, Smartphone } from "lucide-react"

type NotificationPreferencesProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationPreferences({ open, onOpenChange }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    pushEnabled: true,
    moderationNotifications: true,
    registrationNotifications: true,
    alertNotifications: true,
    announcementNotifications: false,
    soundEnabled: true,
    desktopNotifications: true,
  })

  useEffect(() => {
    if (open) {
      // Charger les préférences sauvegardées
      const saved = localStorage.getItem("notification_preferences")
      if (saved) {
        try {
          setPreferences(JSON.parse(saved))
        } catch {
          // Utiliser les valeurs par défaut
        }
      }
    }
  }, [open])

  const handleSave = () => {
    // Sauvegarder les préférences
    localStorage.setItem("notification_preferences", JSON.stringify(preferences))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold leading-tight flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Préférences de Notifications
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Configurez comment et quand vous recevez des notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Canaux de notification */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Canaux de notification</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="font-medium">Notifications push</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications push</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.pushEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, pushEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Types de notifications */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Types de notifications</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label className="font-medium">Modération</Label>
                  <p className="text-sm text-muted-foreground">Nouveaux contenus à modérer</p>
                </div>
                <Switch
                  checked={preferences.moderationNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, moderationNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label className="font-medium">Inscriptions</Label>
                  <p className="text-sm text-muted-foreground">Nouvelles inscriptions d'utilisateurs</p>
                </div>
                <Switch
                  checked={preferences.registrationNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, registrationNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label className="font-medium">Alertes système</Label>
                  <p className="text-sm text-muted-foreground">Alertes et avertissements système</p>
                </div>
                <Switch
                  checked={preferences.alertNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, alertNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label className="font-medium">Annonces</Label>
                  <p className="text-sm text-muted-foreground">Nouvelles annonces publiées</p>
                </div>
                <Switch
                  checked={preferences.announcementNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, announcementNotifications: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Options supplémentaires */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Options</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label className="font-medium">Son de notification</Label>
                  <p className="text-sm text-muted-foreground">Jouer un son pour les nouvelles notifications</p>
                </div>
                <Switch
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, soundEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label className="font-medium">Notifications desktop</Label>
                  <p className="text-sm text-muted-foreground">Afficher les notifications sur le bureau</p>
                </div>
                <Switch
                  checked={preferences.desktopNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, desktopNotifications: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

