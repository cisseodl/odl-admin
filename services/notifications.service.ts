import { fetchApi } from "./api.service";
import { Announcement, Notification } from "@/types/notifications"; // Import both types

export class NotificationsService {
  // --- Méthodes pour les Annonces (déjà existantes) ---
  async getAllAnnouncements(): Promise<Announcement[]> {
    const response = await fetchApi<any>("/announcements", { method: "GET" });
    // Assuming API returns an array directly or inside a 'data' property
    return response.data || response;
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'readCount' | 'totalRecipients' | 'sentAt' | 'status'>): Promise<Announcement> {
    const response = await fetchApi<any>("/announcements", {
      method: "POST",
      body: announcement,
    });
    return response.data;
  }

  async updateAnnouncement(id: number, announcement: Partial<Announcement>): Promise<Announcement> {
    const response = await fetchApi<any>(`/announcements/${id}`, {
      method: "PUT",
      body: announcement,
    });
    return response.data || response;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await fetchApi<any>(`/announcements/${id}`, {
      method: "DELETE",
    });
  }

  async sendAnnouncement(id: number): Promise<void> {
    await fetchApi<any>(`/announcements/${id}/send`, {
      method: "POST",
    });
  }

  // --- Nouvelles méthodes pour les Notifications génériques ---
  async getAllNotifications(): Promise<Notification[]> {
    const response = await fetchApi<any>("/api/notifications", { method: "GET" }); // Nouvel endpoint supposé
    return response.data || response;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await fetchApi<any>(`/api/notifications/${id}/read`, { method: "PUT" }); // Nouvel endpoint supposé
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await fetchApi<any>("/api/notifications/read-all", { method: "PUT" }); // Nouvel endpoint supposé
  }

  async archiveNotification(id: number): Promise<void> {
    await fetchApi<any>(`/api/notifications/${id}/archive`, { method: "PUT" }); // Nouvel endpoint supposé
  }

  // deleteNotification est potentiellement la même que deleteAnnouncement si l'API est agnostique
  // Je vais créer une delete spécifique pour Notification pour la clarté.
  async deleteNotification(id: number): Promise<void> {
    await fetchApi<any>(`/api/notifications/${id}`, { method: "DELETE" }); // Nouvel endpoint supposé
  }

  async getNotificationStats(): Promise<{ unreadCount: number; totalCount: number }> {
    try {
      const response = await fetchApi<any>("/api/notifications/stats", { method: "GET" });
      return response.data || { unreadCount: 0, totalCount: 0 };
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      return { unreadCount: 0, totalCount: 0 };
    }
  }
}

export const notificationsService = new NotificationsService();
