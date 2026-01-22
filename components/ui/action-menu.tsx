"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

type Action = {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: "default" | "destructive"
}

type ActionMenuProps = {
  actions: Action[]
  trigger?: ReactNode
}

export function ActionMenu({ actions, trigger }: ActionMenuProps) {
  // S'assurer que actions est toujours un tableau pour éviter l'erreur "Cannot read properties of undefined"
  const safeActions = Array.isArray(actions) ? actions : []
  const defaultActions = safeActions.filter((a) => !a.variant || a.variant === "default")
  const destructiveActions = safeActions.filter((a) => a.variant === "destructive")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {defaultActions.map((action, index) => (
          <DropdownMenuItem key={index} onClick={action.onClick}>
            {action.icon || <Eye className="mr-2 h-4 w-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}
        {destructiveActions.length > 0 && <DropdownMenuSeparator />}
        {destructiveActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            className="text-destructive focus:text-destructive"
          >
            {action.icon || <Trash2 className="mr-2 h-4 w-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

