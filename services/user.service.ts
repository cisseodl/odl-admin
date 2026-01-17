import { UserDb } from '../models/user-db.model'; // Use UserDb for backend interaction
import { fetchApi } from './api.service';

export class UserService {
  async getAllUsers(page: number, size: number): Promise<{ content: UserDb[], totalElements: number }> {
    try {
      const response = await fetchApi<any>(`/api/users/get-all/${page}/${size}`, { method: "GET" });
      // Le backend retourne maintenant une structure paginée avec content et totalElements
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        return {
          content: response.data.content,
          totalElements: response.data.totalElements || response.data.content.length
        };
      }
      // Fallback pour l'ancien format (tableau simple)
      if (Array.isArray(response.data)) {
        return { content: response.data, totalElements: response.data.length };
      }
      return { content: [], totalElements: 0 };
    } catch (error: any) {
      console.error("Error fetching all users:", error);
      return { content: [], totalElements: 0 };
    }
  }

  async getAllAdmins(): Promise<UserDb[]> {
    try {
      const response = await fetchApi<any>("/admins/get-all", { method: "GET" });
      return response.data; // Return response.data for consistency
    } catch (error) {
      console.error("Error fetching all admins:", error);
      return [];
    }
  }

  async getAdminById(id: number): Promise<UserDb | null> {
    try {
      const response = await fetchApi<any>(`/admins/${id}`, { method: "GET" });
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching admin with ID ${id}:`, error);
      return null;
    }
  }

  async checkUserByPhone(phone: string): Promise<boolean> {
    const response = await fetchApi<any>(`/users/check/${phone}`, { method: "GET" });
    return response.data;
  }

  // Other methods (getUserById, createUser, updateUser, deleteUser) not explicitly defined in test.md.
  async getUserById(id: number): Promise<UserDb | null> {
    try {
      const response = await fetchApi<any>(`/users/${id}`, { method: "GET" });
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  }

  async createUser(user: Omit<UserDb, 'id'>): Promise<UserDb> {
    const response = await fetchApi<any>("/users/save", {
      method: "POST",
      body: user,
    });
    return response.data;
  }

  async updateUser(id: number, userData: Partial<UserDb>): Promise<UserDb> {
    const response = await fetchApi<any>(`/users/update/${id}`, {
      method: "PUT",
      body: userData,
    });
    return response.data || response;
  }

  async deleteUser(id: number): Promise<void> {
    await fetchApi<any>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async getMyProfile(): Promise<UserDb> { // Nouvelle méthode
    const response = await fetchApi<any>("/api/profile/me", { method: "GET" });
    return response.data || response;
  }

  async updateMyProfile(userData: Partial<UserDb>): Promise<UserDb> { // Nouvelle méthode
    const response = await fetchApi<any>("/api/profile/me", {
      method: "PUT",
      body: userData,
    });
    return response.data || response;
  }

  async updateNotificationPreferences(userId: number, preferences: { emailNotificationsEnabled: boolean }): Promise<any> { // Nouvelle méthode
    const queryParams = new URLSearchParams();
    queryParams.append("emailNotificationsEnabled", preferences.emailNotificationsEnabled.toString());

    const response = await fetchApi<any>(`/api/users/${userId}/notification-preferences?${queryParams.toString()}`, {
      method: "PUT",
    });
    return response.data || response;
  }

  async getNotificationPreferences(userId: number): Promise<{ emailNotificationsEnabled: boolean; smsNotificationsEnabled: boolean }> {
    try {
      const response = await fetchApi<any>(`/api/users/${userId}/notification-preferences`, { method: "GET" });
      return response.data || { emailNotificationsEnabled: false, smsNotificationsEnabled: false };
    } catch (error) {
      console.error(`Error fetching notification preferences for user ID ${userId}:`, error);
      return { emailNotificationsEnabled: false, smsNotificationsEnabled: false };
    }
  }

  async blacklistUser(userId: number): Promise<void> {
    await fetchApi<any>(`/users/${userId}/blacklist`, {
      method: "PUT",
    });
  }

  async unblacklistUser(userId: number): Promise<void> {
    await fetchApi<any>(`/users/${userId}/unblacklist`, {
      method: "PUT",
    });
  }

  async getUserEnrollments(userId: number): Promise<Array<{ courseId: number; courseTitle: string }>> {
    try {
      // Récupérer les détails d'inscription pour cet utilisateur
      const response = await fetchApi<any>(`/details-course/user/${userId}`, { method: "GET" });
      if (Array.isArray(response.data)) {
        return response.data.map((enrollment: any) => ({
          courseId: enrollment.courseId || enrollment.course?.id,
          courseTitle: enrollment.courseTitle || enrollment.course?.title || `Cours ${enrollment.courseId}`,
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching enrollments for user ID ${userId}:`, error);
      return [];
    }
  }
}

export const userService = new UserService();
