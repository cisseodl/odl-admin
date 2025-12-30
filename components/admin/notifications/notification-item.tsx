"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ActionMenu } from "@/components/ui/action-menu"
import { Checkbox } from "@/components/ui/checkbox"
import type { Notification } from "@/types/notifications"
import { 
  CheckCircle2, 
  Archive, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  UserPlus, 
  Bell, 
  Megaphone,
  Shield,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Format simple de date
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "À l'instant"
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  return date.toLocaleDateString("fr-FR")
}

type NotificationItemProps = {
  notification: Notification
  isSelected?: boolean
  onToggleSelection?: (id: number) => void
  onMarkAsRead: (id: number) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
}

export function NotificationItem({
  notification,
  isSelected = false,
  onToggleSelection,
  onMarkAsRead,
  onArchive,
  onDelete,
}: NotificationItemProps) {
  const router = useRouter()

  const getTypeConfig = () => {
    switch (notification.type) {
      case "moderation":
        return {
          icon: <Shield className="h-5 w-5" />,
          bgColor: "bg-[rgb(255,102,0)]",
          iconColor: "text-white",
          badgeColor: "bg-[rgb(255,102,0)]/10 text-[rgb(255,102,0)] border-[rgb(255,102,0)]/30",
          badge: "Modération"
        }
      case "registration":
        return {
          icon: <UserPlus className="h-5 w-5" />,
          bgColor: "bg-[rgb(255,102,0)]",
          iconColor: "text-white",
          badgeColor: "bg-[rgb(255,102,0)]/10 text-[rgb(255,102,0)] border-[rgb(255,102,0)]/30",
          badge: "Inscription"
        }
      case "alert":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: "bg-[rgb(0,0,0)] dark:bg-[rgb(50,50,50)]",
          iconColor: "text-white",
          badgeColor: "bg-[rgb(0,0,0)]/10 dark:bg-[rgb(50,50,50)]/20 text-[rgb(0,0,0)] dark:text-[rgb(150,150,150)] border-[rgb(0,0,0)]/20 dark:border-[rgb(50,50,50)]/30",
          badge: "Alerte"
        }
      case "announcement":
        return {
          icon: <Megaphone className="h-5 w-5" />,
          bgColor: "bg-[rgb(255,102,0)]",
          iconColor: "text-white",
          badgeColor: "bg-[rgb(255,102,0)]/10 text-[rgb(255,102,0)] border-[rgb(255,102,0)]/30",
          badge: "Annonce"
        }
      default:
        return {
          icon: <Bell className="h-5 w-5" />,
          bgColor: "bg-[rgb(50,50,50)]",
          iconColor: "text-white",
          badgeColor: "bg-[rgb(50,50,50)]/10 text-[rgb(50,50,50)] border-[rgb(50,50,50)]/30",
          badge: "Système"
        }
    }
  }

  const typeConfig = getTypeConfig()
  const isUnread = notification.status === "unread"

  const handleAction = () => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      if (notification.status === "unread") {
        onMarkAsRead(notification.id)
      }
    }
  }

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-xl hover:scale-[1.01]",
        isUnread 
          ? "border-2 border-[rgb(255,102,0)]/50 shadow-lg bg-gradient-to-br from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10 dark:to-transparent" 
          : "border shadow-sm",
        isSelected && "ring-2 ring-[rgb(255,102,0)] ring-offset-2",
        !isUnread && "opacity-80"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox de sélection */}
          {onToggleSelection && (
            <div className="mt-1 flex-shrink-0">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(notification.id)}
                aria-label={`Sélectionner la notification ${notification.title}`}
                className="border-[rgb(50,50,50)] data-[state=checked]:bg-[rgb(255,102,0)] data-[state=checked]:border-[rgb(255,102,0)]"
              />
            </div>
          )}

          {/* Icône de type dans une card circulaire */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md",
            typeConfig.bgColor
          )}>
            <div className={typeConfig.iconColor}>
              {typeConfig.icon}
            </div>
          </div>

          {/* Contenu principal dans une structure de card */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* En-tête avec titre et badges */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className={cn(
                    "font-bold text-base leading-tight",
                    isUnread 
                      ? "text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]" 
                      : "text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)]"
                  )}>
                    {notification.title}
                  </h4>
                  {isUnread && (
                    <Badge 
                      className="h-5 px-2.5 text-xs font-semibold bg-[rgb(255,102,0)] text-white border-0 shadow-sm"
                    >
                      Nouveau
                    </Badge>
                  )}
                </div>
                
                {/* Message dans une card interne */}
                <div className="p-3 rounded-lg bg-[rgb(50,50,50)]/5 dark:bg-[rgb(255,255,255)]/5 border border-[rgb(50,50,50)]/10 mb-3">
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isUnread 
                      ? "text-[rgb(0,0,0)] dark:text-[rgb(200,200,200)]" 
                      : "text-[rgb(50,50,50)] dark:text-[rgb(120,120,120)]"
                  )}>
                    {notification.message}
                  </p>
                </div>

                {/* Footer avec métadonnées et actions */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "h-6 px-2.5 text-xs font-medium",
                        typeConfig.badgeColor
                      )}
                    >
                      {typeConfig.badge}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-[rgb(50,50,50)] dark:text-[rgb(120,120,120)]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                  </div>
                  
                  {notification.actionUrl && notification.actionLabel && (
                    <Button 
                      size="sm" 
                      onClick={handleAction}
                      className="h-8 px-4 text-xs font-semibold bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white border-0 shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      {notification.actionLabel}
                    </Button>
                  )}
                </div>
              </div>

              {/* Menu d'actions */}
              <div className="flex-shrink-0">
                <ActionMenu
                  actions={[
                    {
                      label: notification.status === "unread" ? "Marquer comme lu" : "Marquer comme non lu",
                      icon: <CheckCircle2 className="h-4 w-4" />,
                      onClick: () => onMarkAsRead(notification.id),
                    },
                    {
                      label: "Archiver",
                      icon: <Archive className="h-4 w-4" />,
                      onClick: () => onArchive(notification.id),
                    },
                    {
                      label: "Supprimer",
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: () => onDelete(notification.id),
                      variant: "destructive",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
