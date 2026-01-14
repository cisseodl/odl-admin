"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLoader } from "@/components/ui/page-loader"

export default function UsersPage() {
  const router = useRouter()

  useEffect(() => {
    // Rediriger vers la page des apprenants par défaut
    router.replace("/admin/users/apprenants")
  }, [router])

  return <PageLoader />
}
