import { fetchApi } from "./api.service";

export interface OdcFormation {
  id: number;
  titre: string;
  description?: string;
  lien: string;
  adminId?: number;
  adminName?: string;
  adminEmail?: string;
  activate?: boolean;
  createdBy?: string;
  createdAt?: string;
  lastModifiedAt?: string;
}

export interface OdcFormationRequest {
  titre: string;
  description?: string;
  lien: string;
}

export class OdcFormationService {
  async getAllFormations(): Promise<{ data: OdcFormation[] }> {
    try {
      const response = await fetchApi<any>("/api/odc-formations/read", { method: "GET" });
      
      // Le backend retourne CResponse<List<OdcFormationDto>>
      // Vérifier plusieurs structures de réponse possibles
      let formationsArray: OdcFormation[] = [];
      
      if (response) {
        // Cas 1: response.data est un tableau
        if (response.data && Array.isArray(response.data)) {
          formationsArray = response.data;
        }
        // Cas 2: response est directement un tableau
        else if (Array.isArray(response)) {
          formationsArray = response;
        }
        // Cas 3: response.data.data (double enveloppe)
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          formationsArray = response.data.data;
        }
        // Cas 4: response.ok et response.data contient les données
        else if (response.ok && response.data) {
          const data = response.data;
          if (Array.isArray(data)) {
            formationsArray = data;
          } else if (data.data && Array.isArray(data.data)) {
            formationsArray = data.data;
          }
        }
      }
      
      // S'assurer que formationsArray est toujours un tableau valide
      if (!Array.isArray(formationsArray)) {
        console.warn("[ODC Formations] Response is not an array, using empty array:", formationsArray);
        formationsArray = [];
      }
      
      return { data: formationsArray };
    } catch (error) {
      console.error("Error fetching ODC formations:", error);
      // Retourner un tableau vide en cas d'erreur
      return { data: [] };
    }
  }

  async getFormationById(id: number): Promise<any> {
    const response = await fetchApi<any>(`/api/odc-formations/${id}`, { method: "GET" });
    return response?.data || response || null;
  }

  async createFormation(formationData: OdcFormationRequest): Promise<any> {
    const response = await fetchApi<any>("/api/odc-formations", {
      method: "POST",
      body: formationData,
    });
    return response?.data || response || null;
  }

  async updateFormation(id: number, formationData: OdcFormationRequest): Promise<any> {
    const response = await fetchApi<any>(`/api/odc-formations/${id}`, {
      method: "PUT",
      body: formationData,
    });
    return response?.data || response || null;
  }

  async deleteFormation(id: number): Promise<any> {
    const response = await fetchApi<any>(`/api/odc-formations/${id}`, {
      method: "DELETE",
    });
    return response?.data || response || null;
  }

  async getMyFormations(): Promise<any> {
    const response = await fetchApi<any>("/api/odc-formations/my-formations", { method: "GET" });
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data };
    }
    if (Array.isArray(response)) {
      return { data: response };
    }
    return response;
  }
}

export const odcFormationService = new OdcFormationService();
