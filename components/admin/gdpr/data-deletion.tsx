"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function DataDeletion() {
  const [userId, setUserId] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    if (!userId) {
      alert("Veuillez entrer un ID utilisateur")
      return
    }
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    // Simuler la suppression
    console.log("Suppression des données pour l'utilisateur:", userId)
    alert("Données supprimées avec succès (simulation)")
    setUserId("")
    setShowConfirm(false)
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
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer les données
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description="Cette action est irréversible. Toutes les données de l'utilisateur seront définitivement supprimées."
        confirmText="Supprimer définitivement"
        variant="destructive"
      />
    </>
  )
}

