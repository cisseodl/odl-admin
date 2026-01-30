"use client"

import { useState } from "react"

export function useActionResultDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [title, setTitle] = useState<string | undefined>(undefined)

  const showSuccess = (msg: string, customTitle?: string) => {
    setMessage(msg)
    setIsSuccess(true)
    setTitle(customTitle)
    setIsOpen(true)
  }

  const showError = (msg: string, customTitle?: string) => {
    setMessage(msg)
    setIsSuccess(false)
    setTitle(customTitle)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setMessage("")
    setTitle(undefined)
  }

  return {
    isOpen,
    isSuccess,
    message,
    title,
    showSuccess,
    showError,
    close,
    setIsOpen,
  }
}
