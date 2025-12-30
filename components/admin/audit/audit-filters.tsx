"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import type { AuditFilter, AuditAction, AuditResource } from "@/types/audit"
import { X } from "lucide-react"

type AuditFiltersProps = {
  filter: AuditFilter
  onFilterChange: (filter: AuditFilter) => void
}

export function AuditFilters({ filter, onFilterChange }: AuditFiltersProps) {
  const updateFilter = (key: keyof AuditFilter, value: string | number | undefined) => {
    onFilterChange({ ...filter, [key]: value || undefined })
  }

  const clearFilters = () => {
    onFilterChange({})
  }

  const hasActiveFilters = Object.keys(filter).length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchBar
          placeholder="Rechercher dans les logs..."
          value={filter.search || ""}
          onChange={(value) => updateFilter("search", value)}
        />
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <Select
            value={filter.action || "all"}
            onValueChange={(value) => updateFilter("action", value === "all" ? undefined : (value as AuditAction))}
          >
            <SelectTrigger id="action">
              <SelectValue placeholder="Toutes les actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="create">Création</SelectItem>
              <SelectItem value="update">Modification</SelectItem>
              <SelectItem value="delete">Suppression</SelectItem>
              <SelectItem value="view">Consultation</SelectItem>
              <SelectItem value="approve">Approbation</SelectItem>
              <SelectItem value="reject">Rejet</SelectItem>
              <SelectItem value="login">Connexion</SelectItem>
              <SelectItem value="logout">Déconnexion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resource">Ressource</Label>
          <Select
            value={filter.resource || "all"}
            onValueChange={(value) =>
              updateFilter("resource", value === "all" ? undefined : (value as AuditResource))
            }
          >
            <SelectTrigger id="resource">
              <SelectValue placeholder="Toutes les ressources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les ressources</SelectItem>
              <SelectItem value="user">Utilisateur</SelectItem>
              <SelectItem value="course">Formation</SelectItem>
              <SelectItem value="instructor">Instructeur</SelectItem>
              <SelectItem value="category">Catégorie</SelectItem>
              <SelectItem value="certification">Certification</SelectItem>
              <SelectItem value="content">Contenu</SelectItem>
              <SelectItem value="badge">Badge</SelectItem>
              <SelectItem value="announcement">Annonce</SelectItem>
              <SelectItem value="review">Avis</SelectItem>
              <SelectItem value="system">Système</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="date"
            value={filter.startDate || ""}
            onChange={(e) => updateFilter("startDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="date"
            value={filter.endDate || ""}
            onChange={(e) => updateFilter("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

