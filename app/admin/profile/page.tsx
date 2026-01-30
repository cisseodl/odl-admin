"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { userService } from "@/services/user.service"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { User, Mail, Phone, Save, X } from "lucide-react"
import { PageLoader } from "@/components/ui/page-loader"

export default function AdminProfilePage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogSuccess, setDialogSuccess] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")

  // État du formulaire
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  })

  // Charger les données du profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const profile = await userService.getMyProfile()
        setEditForm({
          fullName: profile.fullName || user.name || "",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
        })
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error)
        // Utiliser les données de l'utilisateur actuel si l'API échoue
        setEditForm({
          fullName: user.name || "",
          email: user.email || "",
          phone: (user as any).phone || "",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Fonction pour sauvegarder les modifications
  const handleSaveProfile = async () => {
    if (!user?.id) {
      setDialogMessage("Impossible de trouver l'ID de l'utilisateur.")
      setDialogSuccess(false)
      setShowDialog(true)
      return
    }

    // Validation
    if (!editForm.fullName || editForm.fullName.trim().length === 0) {
      setDialogMessage("Le nom complet est requis.")
      setDialogSuccess(false)
      setShowDialog(true)
      return
    }

    if (!editForm.email || editForm.email.trim().length === 0) {
      setDialogMessage("L'email est requis.")
      setDialogSuccess(false)
      setShowDialog(true)
      return
    }

    setIsSaving(true)
    try {
      const updatedProfile = await userService.updateMyProfile({
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone?.trim() || undefined,
      })

      // Mettre à jour le contexte utilisateur
      if (updateUser) {
        updateUser({
          ...user,
          name: updatedProfile.fullName || editForm.fullName,
          email: updatedProfile.email || editForm.email,
        })
      }

      setDialogMessage("Vos informations ont été mises à jour avec succès.")
      setDialogSuccess(true)
      setShowDialog(true)
      setIsEditing(false)
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      const errorMsg = error?.message || "Une erreur est survenue lors de la mise à jour de votre profil."
      setDialogMessage(errorMsg)
      setDialogSuccess(false)
      setShowDialog(true)
    } finally {
      setIsSaving(false)
    }
  }

  // Fonction pour annuler l'édition
  const handleCancelEdit = async () => {
    setIsEditing(false)
    // Recharger les données
    try {
      const profile = await userService.getMyProfile()
      setEditForm({
        fullName: profile.fullName || user?.name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
      })
    } catch (error) {
      console.error("Erreur lors du rechargement du profil:", error)
    }
  }

  if (isLoading) {
    return <PageLoader />
  }

  const displayUser = {
    name: isEditing ? editForm.fullName : (user?.name || editForm.fullName),
    email: isEditing ? editForm.email : (user?.email || editForm.email),
    phone: isEditing ? editForm.phone : (editForm.phone || "Non spécifié"),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Mon Profil"
        description="Gérez vos informations personnelles"
      />

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 text-center space-y-4">
            <Avatar className="h-32 w-32 mx-auto border-4 border-primary/10">
              <AvatarImage src={(user as any)?.avatar || "/admin-interface.png"} alt={displayUser.name} />
              <AvatarFallback className="text-3xl">
                {displayUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-2xl font-bold">{displayUser.name}</h2>
              <p className="text-muted-foreground">Administrateur</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{displayUser.email}</span>
              </div>
              {displayUser.phone !== "Non spécifié" && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{displayUser.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations Personnelles</CardTitle>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={displayUser.name}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: Jean Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={displayUser.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={displayUser.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+223 XX XX XX XX"
              />
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex gap-3">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <span className="mr-2">Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de succès/erreur */}
      <ActionResultDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        isSuccess={dialogSuccess}
        message={dialogMessage}
      />
    </div>
  )
}
