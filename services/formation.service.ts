import { fetchApi } from "./api.service";
import { Formation } from "@/models/formation.model";

export interface FormationRequest {
  title: string;
  description?: string;
  imagePath?: string;
  categorieId: number;
  activate?: boolean;
}

export class FormationService {
  /**
   * Récupère toutes les formations
   */
  async getAllFormations(): Promise<Formation[]> {
    try {
      const response = await fetchApi<any>("/api/formations/read", { method: "GET" });
      // Backend retourne CResponse avec structure { ok, data, message }
      if (!response) {
        console.warn("getAllFormations: API response is null or undefined");
        return [];
      }
      // Gérer les deux formats possibles : { data: [...] } ou directement [...]
      const data = response.data || response;
      if (!data) {
        console.warn("getAllFormations: API response data is empty or null");
        return [];
      }
      return Array.isArray(data) ? data : [data];
    } catch (error: any) {
      console.error("Error fetching formations:", error);
      return [];
    }
  }

  /**
   * Récupère une formation par son ID
   */
  async getFormationById(id: number): Promise<Formation | null> {
    try {
      const response = await fetchApi<any>(`/api/formations/read/${id}`, { method: "GET" });
      if (!response || !response.data) {
        console.warn(`getFormationById: API response data is empty or null for formation ${id}`);
        return null;
      }
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching formation ${id}:`, error);
      return null;
    }
  }

  /**
   * Récupère toutes les formations d'une catégorie
   */
  async getFormationsByCategorieId(categorieId: number): Promise<Formation[]> {
    try {
      const response = await fetchApi<any>(`/api/formations/read/by-category/${categorieId}`, { method: "GET" });
      if (!response) {
        console.warn(`getFormationsByCategorieId: API response is null or undefined for categorie ${categorieId}`);
        return [];
      }
      // Gérer les deux formats possibles : { data: [...] } ou directement [...]
      const data = response.data || response;
      if (!data) {
        console.warn(`getFormationsByCategorieId: API response data is empty or null for categorie ${categorieId}`);
        return [];
      }
      return Array.isArray(data) ? data : [data];
    } catch (error: any) {
      console.error(`Error fetching formations for categorie ${categorieId}:`, error);
      return [];
    }
  }

  /**
   * Crée une nouvelle formation
   */
  async createFormation(formationData: FormationRequest): Promise<Formation | null> {
    try {
      const response = await fetchApi<any>("/api/formations", {
        method: "POST",
        body: formationData,
      });
      return response?.data || response || null;
    } catch (error: any) {
      console.error("Error creating formation:", error);
      throw error;
    }
  }

  /**
   * Met à jour une formation existante
   */
  async updateFormation(id: number, formationData: Partial<FormationRequest>): Promise<Formation | null> {
    try {
      const response = await fetchApi<any>(`/api/formations/${id}`, {
        method: "PUT",
        body: formationData,
      });
      return response?.data || response || null;
    } catch (error: any) {
      console.error(`Error updating formation ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime une formation
   */
  async deleteFormation(id: number): Promise<void> {
    try {
      await fetchApi<any>(`/api/formations/${id}`, {
        method: "DELETE",
      });
    } catch (error: any) {
      console.error(`Error deleting formation ${id}:`, error);
      throw error;
    }
  }
}

export const formationService = new FormationService();

