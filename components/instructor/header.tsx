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
import { Input } from "@/components/ui/input"
import { Bell, Search, User, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { LanguageSwitcher } from "@/components/shared/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export function InstructorHeader() {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 md:px-6">
      <div className="w-10 lg:hidden" />

      <div className="flex-1 flex items-center gap-4 max-w-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher mes formations, apprenants..."
            className="w-full pl-10 bg-background"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">2</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <p className="text-sm font-medium">Nouvel apprenant inscrit</p>
                <p className="text-xs text-muted-foreground mt-1">Marie Dubois s'est inscrite à votre formation</p>
                <p className="text-xs text-muted-foreground mt-1">Il y a 10 minutes</p>
              </div>
              <div className="rounded-lg border p-3 hover:bg-accent cursor-pointer">
                <p className="text-sm font-medium">Formation complétée</p>
                <p className="text-xs text-muted-foreground mt-1">Un apprenant a terminé votre formation React</p>
                <p className="text-xs text-muted-foreground mt-1">Il y a 1 heure</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">Voir toutes les notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2">
              <Avatar className="h-8 w-8">
                {/* Utiliser uniquement AvatarFallback avec initiales, pas de photo */}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "IN"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm font-medium">{user?.name || "Formateur"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name || "Formateur"}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email || "instructor@elearning.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={() => {
                logout()
                // La redirection est gérée par le ProtectedRoute
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

