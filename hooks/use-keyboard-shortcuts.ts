import { useEffect } from "react"

type Shortcut = {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

type UseKeyboardShortcutsOptions = {
  shortcuts: Shortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey
        const shiftMatch = shortcut.shift !== undefined ? (shortcut.shift === e.shiftKey) : true
        const altMatch = shortcut.alt !== undefined ? (shortcut.alt === e.altKey) : true
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, enabled])
}

// Raccourcis par défaut pour l'admin
export const defaultAdminShortcuts: Shortcut[] = [
  {
    key: "k",
    ctrl: true,
    action: () => {
      // Sera géré par GlobalSearch
    },
    description: "Ouvrir la recherche globale",
  },
  {
    key: "n",
    ctrl: true,
    action: () => {
      // Sera géré par le composant qui l'utilise
    },
    description: "Créer un nouvel élément",
  },
  {
    key: "s",
    ctrl: true,
    action: () => {
      // Sera géré par le composant qui l'utilise
    },
    description: "Sauvegarder",
  },
  {
    key: "Escape",
    action: () => {
      // Fermer les modals
      const modals = document.querySelectorAll('[role="dialog"]')
      modals.forEach((modal) => {
        const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="fermer"]')
        if (closeButton instanceof HTMLElement) {
          closeButton.click()
        }
      })
    },
    description: "Fermer les modals",
  },
]

