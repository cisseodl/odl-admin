"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { AuditFilters } from "./audit-filters"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { AuditLogger } from "@/lib/audit/audit-logger"
import type { AuditLog, AuditFilter } from "@/types/audit"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// Format simple de date
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "À l'instant"
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  return date.toLocaleDateString("fr-FR")
}

export function AuditLogComponent() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState<AuditFilter>({})

  useEffect(() => {
    loadLogs()
  }, [filter])

  const loadLogs = () => {
    const filteredLogs = AuditLogger.getFilteredLogs(filter)
    setLogs(filteredLogs)
  }

  const handleExportCSV = () => {
    const csv = AuditLogger.exportToCSV(logs)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    const json = AuditLogger.exportToJSON(logs)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getActionColor = (action: AuditLog["action"]) => {
    switch (action) {
      case "create":
        return "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] dark:bg-[hsl(var(--success))]/30 dark:text-[hsl(var(--success))]"
      case "update":
        return "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary"
      case "delete":
        return "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive"
      case "approve":
        return "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] dark:bg-[hsl(var(--success))]/30 dark:text-[hsl(var(--success))]"
      case "reject":
        return "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getActionLabel = (action: AuditLog["action"]) => {
    const labels = {
      create: "Création",
      update: "Modification",
      delete: "Suppression",
      view: "Consultation",
      approve: "Approbation",
      reject: "Rejet",
      login: "Connexion",
      logout: "Déconnexion",
    }
    return labels[action] || action
  }

  const getResourceLabel = (resource: AuditLog["resource"]) => {
    const labels = {
      user: "Utilisateur",
      course: "Formation",
      instructor: "Instructeur",
      category: "Catégorie",
      certification: "Certification",
      content: "Contenu",
      badge: "Badge",
      announcement: "Annonce",
      review: "Avis",
      system: "Système",
    }
    return labels[resource] || resource
  }

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "timestamp",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{new Date(row.original.timestamp).toLocaleDateString("fr-FR")}</div>
          <div className="text-muted-foreground text-xs">{formatTimeAgo(row.original.timestamp)}</div>
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "Utilisateur",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{row.original.userName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.userName}</span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge className={getActionColor(row.original.action)}>{getActionLabel(row.original.action)}</Badge>
      ),
    },
    {
      accessorKey: "resource",
      header: "Ressource",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{getResourceLabel(row.original.resource)}</div>
          {row.original.resourceName && (
            <div className="text-sm text-muted-foreground">{row.original.resourceName}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
      cell: ({ row }) => <span className="text-sm font-mono">{row.original.ipAddress || "-"}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold leading-tight">Journal d'Audit</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Historique de toutes les actions effectuées sur la plateforme
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuditFilters filter={filter} onFilterChange={setFilter} />
          <DataTable columns={columns} data={logs} searchValue={filter.search || ""} />
        </CardContent>
      </Card>
    </div>
  )
}

