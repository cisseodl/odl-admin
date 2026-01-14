"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Users, BookOpen, GraduationCap, Tag, Award, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { courseService } from "@/services"
import { adminService } from "@/services"
import { instructorService } from "@/services"
import { categorieService } from "@/services"
import { apprenantService } from "@/services"

type SearchResult = {
  id: string
  type: "user" | "course" | "instructor" | "category" | "certification" | "content"
  title: string
  description?: string
  href: string
  icon: React.ReactNode
}

type GlobalSearchProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const typeLabels: Record<SearchResult["type"], string> = {
  user: "Utilisateur",
  course: "Formation",
  instructor: "Instructeur",
  category: "Catégorie",
  certification: "Certification",
  content: "Contenu",
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Recherche simulée
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const filtered = mockSearchResults.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
    )
    setResults(filtered)
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery)
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  // Raccourci clavier Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(true)
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  // Navigation au clavier
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault()
        handleSelectResult(results[selectedIndex])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, results, selectedIndex])

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.href)
    onOpenChange(false)
    setSearchQuery("")
    setResults([])
  }

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<SearchResult["type"], SearchResult[]>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <Command className="rounded-lg border-none">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandInput
              placeholder="Rechercher des utilisateurs, formations, contenus..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex-1 border-none focus:ring-0"
            />
            <Badge variant="outline" className="ml-2 text-xs">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Esc</kbd>
            </Badge>
          </div>
          <CommandList className="max-h-[400px]">
            {searchQuery && Object.keys(groupedResults).length === 0 && (
              <CommandEmpty>Aucun résultat trouvé</CommandEmpty>
            )}
            {!searchQuery && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Commencez à taper pour rechercher...</p>
              </div>
            )}
            {Object.entries(groupedResults).map(([type, items]) => (
              <CommandGroup key={type} heading={typeLabels[type as SearchResult["type"]]}>
                {items.map((result, index) => {
                  const globalIndex = results.indexOf(result)
                  return (
                    <CommandItem
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelectResult(result)}
                      className={cn(
                        "cursor-pointer",
                        globalIndex === selectedIndex && "bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-muted-foreground">{result.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{result.title}</div>
                          {result.description && (
                            <div className="text-xs text-muted-foreground">{result.description}</div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {typeLabels[result.type]}
                        </Badge>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

