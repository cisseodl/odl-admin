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
      console.log("[ODC Formations] Appel de getAllFormations...");
      const response = await fetchApi<any>("/api/odc-formations/read", { method: "GET" });
      console.log("[ODC Formations] Réponse reçue:", { 
        type: typeof response, 
        isArray: Array.isArray(response),
        hasData: !!response?.data,
        dataIsArray: Array.isArray(response?.data),
        keys: response ? Object.keys(response) : []
      });
      
      // Le backend retourne ResponseEntity<CResponse<List<OdcFormationDto>>>
      // fetchApi retourne directement le JSON parsé, donc:
      // - Si ResponseEntity.ok() avec CResponse.success(), alors response = CResponse
      // - response.data = List<OdcFormationDto>
      let formationsArray: OdcFormation[] = [];
      
      if (response) {
        // Cas 1: response.data est un tableau (structure CResponse standard)
        if (response.data && Array.isArray(response.data)) {
          console.log("[ODC Formations] Cas 1: response.data est un tableau, longueur:", response.data.length);
          formationsArray = response.data;
        }
        // Cas 2: response est directement un tableau (structure non standard)
        else if (Array.isArray(response)) {
          console.log("[ODC Formations] Cas 2: response est directement un tableau, longueur:", response.length);
          formationsArray = response;
        }
        // Cas 3: response.data.data (double enveloppe - ResponseEntity<CResponse>)
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log("[ODC Formations] Cas 3: response.data.data est un tableau, longueur:", response.data.data.length);
          formationsArray = response.data.data;
        }
        // Cas 4: response.ok et response.data contient les données
        else if (response.ok !== undefined && response.data) {
          const data = response.data;
          if (Array.isArray(data)) {
            console.log("[ODC Formations] Cas 4a: response.data est un tableau, longueur:", data.length);
            formationsArray = data;
          } else if (data.data && Array.isArray(data.data)) {
            console.log("[ODC Formations] Cas 4b: response.data.data est un tableau, longueur:", data.data.length);
            formationsArray = data.data;
          } else {
            console.warn("[ODC Formations] Cas 4: Structure inattendue de response.data:", data);
          }
        } else {
          console.warn("[ODC Formations] Structure de réponse inattendue:", response);
        }
      } else {
        console.warn("[ODC Formations] Réponse est null ou undefined");
      }
      
      // S'assurer que formationsArray est toujours un tableau valide
      if (!Array.isArray(formationsArray)) {
        console.error("[ODC Formations] formationsArray n'est pas un tableau, type:", typeof formationsArray, "valeur:", formationsArray);
        formationsArray = [];
      }
      
      console.log("[ODC Formations] Retour de getAllFormations avec", formationsArray.length, "formations");
      return { data: formationsArray };
    } catch (error) {
      console.error("[ODC Formations] Erreur lors de la récupération:", error);
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
