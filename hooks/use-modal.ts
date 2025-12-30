import { useState, useCallback } from "react"

type UseModalReturn<T> = {
  isOpen: boolean
  selectedItem: T | null
  open: (item?: T) => void
  close: () => void
  toggle: () => void
}

export function useModal<T = any>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const open = useCallback((item?: T) => {
    setSelectedItem(item || null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setSelectedItem(null)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
    if (isOpen) {
      setSelectedItem(null)
    }
  }, [isOpen])

  return {
    isOpen,
    selectedItem,
    open,
    close,
    toggle,
  }
}

