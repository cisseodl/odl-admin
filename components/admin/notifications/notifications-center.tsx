"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/ui/search-bar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationItem } from "./notification-item"
import { NotificationStats } from "./notification-stats"
import { NotificationPreferences } from "./notification-preferences"
import { notificationsService } from "@/services/notifications.service"
import { useToast } from "@/hooks/use-toast"
import type { Notification, NotificationType } from "@/types/notifications"
import { Bell, CheckCheck, Archive, Trash2, Download, Filter, X, Calendar } from "lucide-react"
import { useSearch } from "@/hooks/use-search"

type SortOption = "newest" | "oldest" | "type"

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<NotificationType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "archived">("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showPreferences, setShowPreferences] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const apiNotifications = await notificationsService.getAllNotifications()
      
      // Convertir les notifications de l'API au format attendu par le composant
      const formattedNotifications: Notification[] = apiNotifications.map((apiNotif: any) => ({
        id: apiNotif.id,
        type: (apiNotif.type?.toLowerCase() || "alert") as NotificationType,
        title: apiNotif.message || "Notification", // Le backend n'a pas de title séparé, utiliser message
        message: apiNotif.message || "",
        status: apiNotif.isRead ? "read" : apiNotif.isArchived ? "archived" : "unread",
        createdAt: apiNotif.createdAt || new Date().toISOString(),
        actionUrl: apiNotif.link || undefined,
        actionLabel: apiNotif.link ? "Voir" : undefined,
        metadata: {},
      }))
      
      setNotifications(formattedNotifications)
    } catch (error: any) {
      console.error("Error loading notifications:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les notifications.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Polling toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const { searchQuery, setSearchQuery, filteredData: searchFiltered } = useSearch<Notification>({
    data: notifications,
    searchKeys: ["title", "message"],
  })

  // Filtrer et trier
  const filteredNotifications = useMemo(() => {
    let filtered = searchFiltered.filter((notification) => {
      const typeMatch = filter === "all" || notification.type === filter
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "unread" && notification.status === "unread") ||
        (statusFilter === "read" && notification.status === "read") ||
        (statusFilter === "archived" && notification.status === "archived")
      return typeMatch && statusMatch
    })

    // Trier
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "type":
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    return filtered
  }, [searchFiltered, filter, statusFilter, sortBy])

  const unreadCount = notifications.filter((n) => n.status === "unread").length
  const archivedCount = notifications.filter((n) => n.status === "archived").length

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markNotificationAsRead(id)
      await loadNotifications()
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast({
        title: "Succès",
        description: "Notification marquée comme lue.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de marquer la notification comme lue.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllNotificationsAsRead()
      await loadNotifications()
      setSelectedIds(new Set())
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de marquer toutes les notifications comme lues.",
        variant: "destructive",
      })
    }
  }

  const handleArchive = async (id: number) => {
    try {
      await notificationsService.archiveNotification(id)
      await loadNotifications()
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast({
        title: "Succès",
        description: "Notification archivée.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'archiver la notification.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await notificationsService.deleteNotification(id)
      await loadNotifications()
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast({
        title: "Succès",
        description: "Notification supprimée.",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la notification.",
        variant: "destructive",
      })
    }
  }

  const handleBulkAction = async (action: "read" | "archive" | "delete") => {
    const count = selectedIds.size
    if (count === 0) return
    
    try {
      const promises = Array.from(selectedIds).map((id) => {
        switch (action) {
          case "read":
            return notificationsService.markNotificationAsRead(id)
          case "archive":
            return notificationsService.archiveNotification(id)
          case "delete":
            return notificationsService.deleteNotification(id)
        }
      })
      await Promise.all(promises)
      await loadNotifications()
      setSelectedIds(new Set())
      toast({
        title: "Succès",
        description: `Action "${action}" effectuée sur ${count} notification(s).`,
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || `Impossible d'effectuer l'action "${action}".`,
        variant: "destructive",
      })
    }
  }

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredNotifications.map((n) => n.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleExport = () => {
    const data = filteredNotifications.map((n) => ({
      Type: n.type,
      Titre: n.title,
      Message: n.message,
      Statut: n.status,
      Date: new Date(n.createdAt).toLocaleString("fr-FR"),
    }))

    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map((row) => Object.values(row).map((v) => `"${v}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `notifications-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTypeCount = (type: NotificationType) => {
    return notifications.filter((n) => n.type === type && n.status !== "archived").length
  }

  const hasActiveFilters = filter !== "all" || statusFilter !== "all" || searchQuery.length > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(255,102,0)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <NotificationStats notifications={notifications} />

      {/* Filtres et actions */}
      <Card className="border-[rgb(255,102,0)]/20">
        <CardHeader className="bg-gradient-to-r from-[rgb(255,102,0)]/5 to-transparent dark:from-[rgb(255,102,0)]/10 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl font-semibold leading-tight flex items-center gap-2 text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                <div className="w-10 h-10 rounded-lg bg-[rgb(255,102,0)]/20 dark:bg-[rgb(255,102,0)]/30 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-[rgb(255,102,0)]" />
                </div>
                Centre de Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-[rgb(255,102,0)] text-white border-0 h-6 px-2.5 text-xs font-semibold">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)] mt-2">
                Gérez toutes vos notifications et alertes système
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPreferences(true)}
                className="border-[rgb(50,50,50)]/30 hover:bg-[rgb(255,102,0)]/10 hover:border-[rgb(255,102,0)]/50 dark:hover:bg-[rgb(255,102,0)]/20"
              >
                Préférences
              </Button>
              {unreadCount > 0 && (
                <Button 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white border-0"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="space-y-4">
            <SearchBar
              placeholder="Rechercher dans les notifications..."
              value={searchQuery}
              onChange={setSearchQuery}
            />

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={(v) => setFilter(v as NotificationType | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="moderation">Modération</SelectItem>
                    <SelectItem value="registration">Inscriptions</SelectItem>
                    <SelectItem value="alert">Alertes</SelectItem>
                    <SelectItem value="announcement">Annonces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="unread">Non lues ({unreadCount})</SelectItem>
                    <SelectItem value="read">Lues</SelectItem>
                    <SelectItem value="archived">Archivées ({archivedCount})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Plus récentes</SelectItem>
                    <SelectItem value="oldest">Plus anciennes</SelectItem>
                    <SelectItem value="type">Par type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setFilter("all")
                  setStatusFilter("all")
                  setSearchQuery("")
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Actions groupées */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-[rgb(255,102,0)]/30 bg-gradient-to-r from-[rgb(255,102,0)]/10 to-[rgb(255,102,0)]/5 dark:from-[rgb(255,102,0)]/20 dark:to-[rgb(255,102,0)]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgb(255,102,0)]/20 dark:bg-[rgb(255,102,0)]/30 flex items-center justify-center">
                  <CheckCheck className="h-4 w-4 text-[rgb(255,102,0)]" />
                </div>
                <span className="text-sm font-semibold text-[rgb(0,0,0)] dark:text-[rgb(255,255,255)]">
                  {selectedIds.size} notification{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={deselectAll}
                  className="text-[rgb(50,50,50)] dark:text-[rgb(150,150,150)] hover:text-[rgb(255,102,0)]"
                >
                  Tout désélectionner
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction("read")}
                  className="border-[rgb(50,50,50)]/30 hover:border-[rgb(255,102,0)]/50"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marquer comme lu
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction("archive")}
                  className="border-[rgb(50,50,50)]/30 hover:border-[rgb(255,102,0)]/50"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archiver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkAction("delete")}
                  className="border-[rgb(50,50,50)]/30 hover:bg-[rgb(0,0,0)]/10 dark:hover:bg-[rgb(255,255,255)]/10 hover:border-[rgb(0,0,0)] dark:hover:border-[rgb(255,255,255)]"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Onglets par type */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger 
                value="moderation"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                Modération ({getTypeCount("moderation")})
              </TabsTrigger>
              <TabsTrigger 
                value="registration"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                Inscriptions ({getTypeCount("registration")})
              </TabsTrigger>
              <TabsTrigger 
                value="alert"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                Alertes ({getTypeCount("alert")})
              </TabsTrigger>
              <TabsTrigger 
                value="announcement"
                className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
              >
                Annonces ({getTypeCount("announcement")})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              <NotificationList
                notifications={filteredNotifications}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
                onMarkAsRead={handleMarkAsRead}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            </TabsContent>

            {(["moderation", "registration", "alert", "announcement"] as NotificationType[]).map((type) => (
              <TabsContent key={type} value={type} className="space-y-2">
                <NotificationList
                  notifications={filteredNotifications.filter((n) => n.type === type)}
                  selectedIds={selectedIds}
                  onToggleSelection={toggleSelection}
                  onSelectAll={selectAll}
                  onDeselectAll={deselectAll}
                  onMarkAsRead={handleMarkAsRead}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de préférences */}
      {showPreferences && (
        <NotificationPreferences open={showPreferences} onOpenChange={setShowPreferences} />
      )}
    </div>
  )
}

type NotificationListProps = {
  notifications: Notification[]
  selectedIds: Set<number>
  onToggleSelection: (id: number) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onMarkAsRead: (id: number) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
}

function NotificationList({
  notifications,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onMarkAsRead,
  onArchive,
  onDelete,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm font-medium">Aucune notification</p>
        <p className="text-xs mt-1">Les nouvelles notifications apparaîtront ici</p>
      </div>
    )
  }

  const allSelected = notifications.length > 0 && notifications.every((n) => selectedIds.has(n.id))
  const someSelected = notifications.some((n) => selectedIds.has(n.id))

  return (
    <div className="space-y-2">
      {notifications.length > 0 && (
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected && !allSelected
              }}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectAll()
                } else {
                  onDeselectAll()
                }
              }}
              className="h-4 w-4 rounded border-gray-300"
              aria-label="Sélectionner toutes les notifications"
            />
            <span className="text-sm text-muted-foreground">
              {someSelected ? `${selectedIds.size} sélectionnée${selectedIds.size > 1 ? "s" : ""}` : "Sélectionner tout"}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {notifications.map((notification) => (
          <div key={notification.id} className="transform transition-transform hover:scale-[1.01]">
            <NotificationItem
              notification={notification}
              isSelected={selectedIds.has(notification.id)}
              onToggleSelection={onToggleSelection}
              onMarkAsRead={onMarkAsRead}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
