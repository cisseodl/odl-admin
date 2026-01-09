"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { userService } from "@/services"
import { useToast } from "@/hooks/use-toast"

export function DataDeletion() {
  const [userId, setUserId] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = () => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID utilisateur",
        variant: "destructive",
      })
      return
    }
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    if (!userId) return
    
    setIsDeleting(true)
    try {
      await userService.deleteUser(Number(userId))
      toast({
        title: "Succès",
        description: "L'utilisateur et toutes ses données associées ont été supprimés avec succès.",
      })
      setUserId("")
      setShowConfirm(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      })
      console.error("Error deleting user:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold leading-tight flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Suppression des Données (Droit à l'Oubli)
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Supprimez définitivement toutes les données d'un utilisateur (conformité RGPD)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deleteUserId">ID Utilisateur</Label>
            <Input
              id="deleteUserId"
              type="number"
              placeholder="Entrez l'ID de l'utilisateur"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Suppression en cours..." : "Supprimer les données"}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Cette action est irréversible. Toutes les données de l'utilisateur (ID: ${userId}) seront définitivement supprimées, y compris ses rôles (Admin, Formateur, Apprenant) et toutes ses données associées.`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer définitivement"}
        variant="destructive"
      />
    </>
  )
}

