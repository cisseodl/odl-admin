"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
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
import { NotificationService } from "@/lib/notifications/notification-service"
import { NotificationItem } from "@/components/admin/notifications/notification-item"
import type { Notification } from "@/types/notifications"
import { useRouter } from "next/navigation"
import { GlobalSearch } from "@/components/admin/global-search"
import { KeyboardShortcutsHelp } from "@/components/admin/keyboard-shortcuts-help"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/shared/language-switcher"

export function Header() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  // Raccourci pour afficher l'aide des raccourcis
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "?",
        action: () => setShortcutsHelpOpen(true),
        description: t('header.shortcuts_help'),
      },
    ],
  })

  useEffect(() => {
    loadNotifications()
    // Polling toutes les 30 secondes pour les nouvelles notifications
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = () => {
    const allNotifications = NotificationService.getAllNotifications()
    const recentNotifications = allNotifications.slice(0, 5) // 5 plus récentes
    setNotifications(recentNotifications)
    setUnreadCount(NotificationService.getUnreadCount())
  }

  const handleMarkAsRead = (id: number) => {
    NotificationService.markAsRead(id)
    loadNotifications()
  }

  const handleArchive = (id: number) => {
    NotificationService.archiveNotification(id)
    loadNotifications()
  }

  const handleDelete = (id: number) => {
    NotificationService.deleteNotification(id)
    loadNotifications()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 md:px-6">
      <div className="w-10 lg:hidden" />

      <div className="flex-1 flex items-center gap-4 max-w-2xl hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('header.search_placeholder')}
            className="w-full pl-10 bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            aria-label={t('header.search_label')}
            onClick={() => setSearchOpen(true)}
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              aria-label={`Notifications (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})`}
              aria-live="polite"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[rgb(255,102,0)] text-white border-0 font-semibold" aria-hidden="true">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0" role="menu" aria-label={t('notifications.menu_label')}>
            {/* En-tête avec badge */}
            <div className="px-4 py-3 border-b bg-gradient-to-r from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[rgb(255,102,0)]" />
                  <span className="font-semibold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-[rgb(255,102,0)] text-white border-0 h-6 px-2.5 text-xs font-semibold">
                    {unreadCount} nouveau{unreadCount > 1 ? "x" : ""}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Liste des notifications */}
            <div className="max-h-[450px] overflow-y-auto" role="list">
              {notifications.length > 0 ? (
                <div className="p-3 space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="transform transition-transform hover:scale-[1.02]">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onArchive={handleArchive}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-[rgb(255,102,0)]/10 dark:bg-[rgb(255,102,0)]/20 flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-[rgb(255,102,0)] opacity-50" />
                  </div>
                  <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)] mb-1">
                    {t('notifications.noNotifications')}
                  </p>
                  <p className="text-xs text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)] text-center">
                    {t('notifications.allUpToDate')}
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer avec lien vers toutes les notifications */}
            {notifications.length > 0 && (
              <>
                <div className="border-t" />
                <div className="px-4 py-3">
                  <DropdownMenuItem 
                    className="justify-center h-9 text-[rgb(255,102,0)] hover:text-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/10 dark:hover:bg-[rgb(255,102,0)]/20 font-medium"
                    onClick={() => router.push("/admin/notifications")}
                  >
                    Voir toutes les notifications
                  </DropdownMenuItem>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="gap-2 pl-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              aria-label={`${t('header.profile')} - ${user?.name || t('header.admin')}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/admin-interface.png" alt={user?.name || t('header.admin')} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs" aria-hidden="true">AD</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm font-medium">{user?.name || t('header.admin')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name || t('header.admin')}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email || "admin@elearning.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              {t('header.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              {t('header.settings')}
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
              {t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <KeyboardShortcutsHelp open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />
    </header>
  )
}
