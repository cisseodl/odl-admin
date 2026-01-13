"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PageLoader } from "@/components/ui/page-loader"

export default function InstructorSettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Rediriger les instructeurs vers leur dashboard
    if (!isLoading && user) {
      router.replace("/instructor")
    }
  }, [user, isLoading, router])

  // Afficher un loader pendant la vérification
  return <PageLoader />
}

