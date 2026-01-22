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
import { useEffect, useState } from "react"
import { notificationsService } from "@/services/notifications.service"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

// Type pour les notifications du backend
type BackendNotification = {
  id: number
  message: string
  type?: string
  isRead: boolean
  isArchived: boolean
  createdAt?: string
  link?: string
}

export function InstructorHeader() {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [notifications, setNotifications] = useState<BackendNotification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const fetchNotificationStats = async () => {
    try {
      const stats = await notificationsService.getNotificationStats()
      setUnreadCount(stats.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notification stats:", error)
      setUnreadCount(0)
    }
  }

  const loadNotifications = async () => {
    if (!user) return
    setLoadingNotifications(true)
    try {
      const allNotifications = await notificationsService.getAllNotifications()
      // Prendre les 5 plus récentes
      const recentNotifications = Array.isArray(allNotifications) 
        ? allNotifications.slice(0, 5)
        : []
      setNotifications(recentNotifications)
    } catch (error) {
      console.error("Error loading notifications:", error)
      setNotifications([])
    } finally {
      setLoadingNotifications(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotificationStats()
      // Rafraîchir les stats toutes les 30 secondes
      const interval = setInterval(fetchNotificationStats, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markNotificationAsRead(id)
      await loadNotifications()
      await fetchNotificationStats()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await notificationsService.deleteNotification(id)
      await loadNotifications()
      await fetchNotificationStats()
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }
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
        <DropdownMenu onOpenChange={(open: boolean) => {
          if (open) {
            loadNotifications()
          }
        }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[rgb(255,102,0)] text-white border-0">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0">
            {/* En-tête avec badge */}
            <div className="px-4 py-3 border-b bg-gradient-to-r from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[rgb(255,102,0)]" />
                  <span className="font-semibold">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-[rgb(255,102,0)] text-white border-0 h-6 px-2.5 text-xs font-semibold">
                    {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Liste des notifications */}
            <div className="max-h-[450px] overflow-y-auto">
              {loadingNotifications ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="p-3 space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors ${
                        !notification.isRead ? "bg-[rgb(255,102,0)]/5 border-[rgb(255,102,0)]/20" : ""
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message || "Notification"}</p>
                          {notification.type && (
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {notification.type}
                            </p>
                          )}
                          {notification.createdAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {(() => {
                                try {
                                  return formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: fr,
                                  })
                                } catch {
                                  return "Récemment"
                                }
                              })()}
                            </p>
                          )}
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-[rgb(255,102,0)] flex-shrink-0 mt-1" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">Aucune notification</p>
                  <p className="text-xs text-muted-foreground mt-1">Vous n'avez pas de nouvelles notifications</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="justify-center"
                  onClick={async () => {
                    try {
                      await notificationsService.markAllNotificationsAsRead()
                      await loadNotifications()
                      await fetchNotificationStats()
                    } catch (error) {
                      console.error("Error marking all as read:", error)
                    }
                  }}
                >
                  Marquer tout comme lu
                </DropdownMenuItem>
              </>
            )}
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

