"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { useState } from "react"

export function DataExport() {
  const [userId, setUserId] = useState("")

  const handleExport = () => {
    if (!userId) {
      alert("Veuillez entrer un ID utilisateur")
      return
    }

    // Simuler l'export des données
    const userData = {
      id: userId,
      name: "Utilisateur",
      email: "user@example.com",
      createdAt: new Date().toISOString(),
      courses: [],
      progress: [],
      certificates: [],
    }

    const json = JSON.stringify(userData, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `user-data-${userId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold leading-tight">Export des Données Utilisateur</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Exportez toutes les données d'un utilisateur au format JSON (conformité RGPD)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">ID Utilisateur</Label>
          <Input
            id="userId"
            type="number"
            placeholder="Entrez l'ID de l'utilisateur"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exporter les données
        </Button>
      </CardContent>
    </Card>
  )
}

