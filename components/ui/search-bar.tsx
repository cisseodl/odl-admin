"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

type SearchBarProps = {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  debounceMs?: number
}

export function SearchBar({
  placeholder = "Rechercher...",
  value,
  onChange,
  className,
  debounceMs = 300,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}

