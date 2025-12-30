import { Apprenant } from '../models/apprenant.model';
import { fetchApi } from './api.service';

export class ApprenantService {
  async getAllApprenants(): Promise<Apprenant[]> {
    const apiResponse = await fetchApi<any>("/apprenants/get-all", { method: "GET" });
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    } else if (apiResponse && apiResponse.data) {
      return apiResponse.data;
    } else {
      console.error("API response for /apprenants/get-all is not in expected format (missing 'data' property or not an array):", apiResponse);
      throw new Error("Invalid API response format for apprenants.");
    }
  }

  async getApprenantsByCohorte(cohorteId: number, page: number, size: number): Promise<any> {
    const response = await fetchApi<any>(`/apprenants/get-by-cohorte/${cohorteId}/${page}/${size}`, { method: "GET" });
    return response.data;
  }

  async createApprenant(apprenant: Omit<Apprenant, 'id'>): Promise<Apprenant> {
    const response = await fetchApi<any>("/apprenants/save", {
      method: "POST",
      body: apprenant,
    });
    return response.data;
  }

  async getApprenantById(id: number): Promise<Apprenant | null> {
    // There is no explicit get by ID for apprenant in test.md, but a generic one can be assumed if needed.
    // For now, returning null or implementing a generic read for all.
    console.log(`Fetching apprenant with ID: ${id}`);
    return null;
  }

  async updateApprenant(id: number, apprenantData: Partial<Apprenant>): Promise<Apprenant> {
    const response = await fetchApi<any>(`/apprenants/update/${id}`, {
      method: "PUT",
      body: apprenantData,
    });
    return response.data || response;
  }

  async deleteApprenant(id: number): Promise<void> {
    await fetchApi<any>(`/apprenants/delete/${id}`, {
      method: "DELETE",
    });
  }
}

export const apprenantService = new ApprenantService();
