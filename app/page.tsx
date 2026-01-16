"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect"
import Image from "next/image"

export default function HomePage() {
  // Rediriger automatiquement si déjà connecté
  useRedirectIfAuthenticated()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image 
            src="/logo.png" 
            alt="Logo E-Learning" 
            width={48} 
            height={48} 
            className="h-12 w-12 object-contain"
            priority
          />
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome Orange Digital Center Mali e_-learning plateforme
          </h1>
        </div>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Connectez-vous pour accéder à votre espace de travail
        </p>
        <Button asChild size="lg" className="mt-6">
          <a href="/login">
            <LogIn className="mr-2 h-5 w-5" />
            Se connecter
          </a>
        </Button>
      </div>
    </div>
  )
}

