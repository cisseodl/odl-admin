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
  async getAllFormations(): Promise<any> {
    const response = await fetchApi<any>("/api/odc-formations", { method: "GET" });
    // Le backend retourne CResponse<List<OdcFormationDto>>
    if (response.data && Array.isArray(response.data)) {
      return { data: response.data };
    }
    if (Array.isArray(response)) {
      return { data: response };
    }
    return response;
  }

  async getFormationById(id: number): Promise<any> {
    const response = await fetchApi<any>(`/api/odc-formations/${id}`, { method: "GET" });
    return response.data || response;
  }

  async createFormation(formationData: OdcFormationRequest): Promise<any> {
    const response = await fetchApi<any>("/api/odc-formations", {
      method: "POST",
      body: formationData,
    });
    return response.data || response;
  }

  async updateFormation(id: number, formationData: OdcFormationRequest): Promise<any> {
    const response = await fetchApi<any>(`/api/odc-formations/${id}`, {
      method: "PUT",
      body: formationData,
    });
    return response.data || response;
  }

  async deleteFormation(id: number): Promise<any> {
    const response = await fetchApi<any>(`/api/odc-formations/${id}`, {
      method: "DELETE",
    });
    return response.data || response;
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
