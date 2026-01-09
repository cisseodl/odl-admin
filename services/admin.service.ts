import { fetchApi } from "./api.service";
import { UserDb } from "@/models/user-db.model"; // Import UserDb model

// Interface pour AdminWithUserDto du backend (avec jointure JPA)
export interface ApiAdmin {
  id: number;
  createdAt?: string;
  lastModifiedAt?: string;
  activate?: boolean;
  // Données User directement dans le DTO (pas dans un sous-objet user)
  userId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  userActivate?: boolean;
}

export class AdminService {
  async getAllAdmins(): Promise<any> {
    const response = await fetchApi<any>("/admins/get-all", { method: "GET" });
    // Backend retourne CResponse avec structure { ok: boolean, data: User[], message: string }
    return response.data || response;
  }

  async getAdminById(id: number): Promise<any> {
    try {
      const response = await fetchApi<any>(`/admins/${id}`, { method: "GET" });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching admin with ID ${id}:`, error);
      throw error;
    }
  }

  async promoteUserToAdmin(userId: number): Promise<any> {
    // Envoyer userId comme paramètre de requête au lieu du body
    // Ne pas envoyer de body pour éviter l'erreur 415
    const response = await fetchApi<any>(`/admins/create?userId=${userId}`, {
      method: "POST",
      // Pas de body, on utilise le paramètre userId
    });
    return response.data || response;
  }

  async updateAdmin(id: number, adminData: Partial<UserDb>): Promise<any> {
    const response = await fetchApi<any>(`/admins/${id}`, {
      method: "PUT",
      body: adminData,
    });
    return response.data || response;
  }

  async deleteAdmin(id: number): Promise<any> {
    const response = await fetchApi<any>(`/admins/${id}`, {
      method: "DELETE",
    });
    return response.data || response;
  }
}

export const adminService = new AdminService();
