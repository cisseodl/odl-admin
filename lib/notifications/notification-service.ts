import type { Notification, NotificationType, NotificationStatus } from "@/types/notifications"

export class NotificationService {
  private static readonly STORAGE_KEY = "notifications"
  private static readonly MAX_NOTIFICATIONS = 100

  /**
   * Récupère toutes les notifications
   */
  static getAllNotifications(): Notification[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      const notifications = JSON.parse(stored) as Notification[]
      
      // Nettoyer les doublons par ID
      const uniqueNotifications = this.removeDuplicateIds(notifications)
      
      // Si des doublons ont été trouvés, sauvegarder la version nettoyée
      if (uniqueNotifications.length !== notifications.length) {
        this.saveNotifications(uniqueNotifications)
      }
      
      return uniqueNotifications
    } catch {
      return []
    }
  }

  /**
   * Supprime les notifications avec des IDs dupliqués
   */
  private static removeDuplicateIds(notifications: Notification[]): Notification[] {
    const seen = new Set<number>()
    const unique: Notification[] = []
    
    for (const notification of notifications) {
      if (!seen.has(notification.id)) {
        seen.add(notification.id)
        unique.push(notification)
      }
    }
    
    return unique
  }

  /**
   * Récupère les notifications non lues
   */
  static getUnreadNotifications(): Notification[] {
    return this.getAllNotifications().filter((n) => n.status === "unread")
  }

  /**
   * Récupère les notifications par type
   */
  static getNotificationsByType(type: NotificationType): Notification[] {
    return this.getAllNotifications().filter((n) => n.type === type)
  }

  /**
   * Génère un ID unique pour une notification
   */
  private static generateUniqueId(): number {
    const notifications = this.getAllNotifications()
    const existingIds = new Set(notifications.map((n) => n.id))
    
    // Utiliser timestamp + random pour garantir l'unicité
    let id: number
    do {
      id = Date.now() + Math.floor(Math.random() * 1000)
    } while (existingIds.has(id))
    
    return id
  }

  /**
   * Crée une nouvelle notification
   */
  static createNotification(notification: Omit<Notification, "id" | "createdAt" | "status">): Notification {
    const notifications = this.getAllNotifications()
    const newNotification: Notification = {
      ...notification,
      id: this.generateUniqueId(),
      status: "unread",
      createdAt: new Date().toISOString(),
    }

    // Ajouter en début de liste
    notifications.unshift(newNotification)

    // Limiter le nombre de notifications
    if (notifications.length > this.MAX_NOTIFICATIONS) {
      notifications.splice(this.MAX_NOTIFICATIONS)
    }

    this.saveNotifications(notifications)
    return newNotification
  }

  /**
   * Marque une notification comme lue
   */
  static markAsRead(notificationId: number): void {
    const notifications = this.getAllNotifications()
    const notification = notifications.find((n) => n.id === notificationId)

    if (notification && notification.status === "unread") {
      notification.status = "read"
      notification.readAt = new Date().toISOString()
      this.saveNotifications(notifications)
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  static markAllAsRead(): void {
    const notifications = this.getAllNotifications()
    const now = new Date().toISOString()

    notifications.forEach((notification) => {
      if (notification.status === "unread") {
        notification.status = "read"
        notification.readAt = now
      }
    })

    this.saveNotifications(notifications)
  }

  /**
   * Archive une notification
   */
  static archiveNotification(notificationId: number): void {
    const notifications = this.getAllNotifications()
    const notification = notifications.find((n) => n.id === notificationId)

    if (notification) {
      notification.status = "archived"
      this.saveNotifications(notifications)
    }
  }

  /**
   * Supprime une notification
   */
  static deleteNotification(notificationId: number): void {
    const notifications = this.getAllNotifications().filter((n) => n.id !== notificationId)
    this.saveNotifications(notifications)
  }

  /**
   * Compte les notifications non lues
   */
  static getUnreadCount(): number {
    return this.getUnreadNotifications().length
  }

  /**
   * Sauvegarde les notifications
   */
  private static saveNotifications(notifications: Notification[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.error("Error saving notifications:", error)
    }
  }

  /**
   * Récupère les notifications archivées
   */
  static getArchivedNotifications(): Notification[] {
    return this.getAllNotifications().filter((n) => n.status === "archived")
  }

  /**
   * Supprime toutes les notifications archivées
   */
  static clearArchived(): void {
    const notifications = this.getAllNotifications().filter((n) => n.status !== "archived")
    this.saveNotifications(notifications)
  }

  /**
   * Supprime toutes les notifications lues
   */
  static clearRead(): void {
    const notifications = this.getAllNotifications().filter((n) => n.status !== "read")
    this.saveNotifications(notifications)
  }

  /**
   * Simule la création de notifications en temps réel (pour démo)
   */
  static simulateRealtimeNotification(): void {
    const types: NotificationType[] = ["moderation", "registration", "alert", "announcement"]
    const randomType = types[Math.floor(Math.random() * types.length)]

    const messages = {
      moderation: {
        title: "Nouveau contenu à modérer",
        message: "Un nouveau contenu nécessite votre attention",
        actionUrl: "/admin/moderation",
        actionLabel: "Voir",
      },
      registration: {
        title: "Nouvelle inscription",
        message: "Un nouvel utilisateur s'est inscrit sur la plateforme",
        actionUrl: "/admin/users",
        actionLabel: "Voir",
      },
      alert: {
        title: "Alerte système",
        message: "Une action nécessite votre attention",
        actionUrl: "/admin/settings",
        actionLabel: "Voir",
      },
      announcement: {
        title: "Nouvelle annonce",
        message: "Une nouvelle annonce a été publiée",
        actionUrl: "/admin/announcements",
        actionLabel: "Voir",
      },
    }

    this.createNotification({
      type: randomType,
      title: messages[randomType].title,
      message: messages[randomType].message,
      actionUrl: messages[randomType].actionUrl,
      actionLabel: messages[randomType].actionLabel,
    })
  }
}

