"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Keyboard } from "lucide-react"
import { defaultAdminShortcuts } from "@/hooks/use-keyboard-shortcuts"

type KeyboardShortcutsHelpProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customShortcuts?: Array<{ key: string; description: string; modifiers?: string }>
}

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
  customShortcuts = [],
}: KeyboardShortcutsHelpProps) {
  const getModifierLabel = (shortcut: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }) => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push("Ctrl")
    if (shortcut.meta) parts.push("Cmd")
    if (shortcut.shift) parts.push("Shift")
    if (shortcut.alt) parts.push("Alt")
    return parts.join(" + ")
  }

  const allShortcuts = [
    ...defaultAdminShortcuts.map((s) => ({
      ...s,
      modifier: getModifierLabel(s),
    })),
    ...customShortcuts.map((s) => ({
      key: s.key,
      description: s.description,
      modifier: s.modifiers || "",
    })),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis clavier
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement dans l'interface
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {allShortcuts.map((shortcut, index) => (
            <div key={index}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex items-center gap-2">
                  {shortcut.modifier && (
                    <>
                      {shortcut.modifier.split(" + ").map((mod, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {mod}
                        </Badge>
                      ))}
                      <span className="text-muted-foreground">+</span>
                    </>
                  )}
                  <Badge variant="outline" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              </div>
              {index < allShortcuts.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>Astuce : Appuyez sur <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">?</kbd> pour afficher cette aide depuis n'importe quelle page</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

