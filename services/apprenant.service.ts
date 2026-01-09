import { Apprenant } from '../models/apprenant.model';
import { fetchApi } from './api.service';

export class ApprenantService {
  async getAllApprenants(): Promise<any> {
    const response = await fetchApi<any>("/apprenants/get-all", { method: "GET" });
    // Backend retourne CResponse avec structure { ok: boolean, data: Apprenant[], message: string }
    return response.data || response; // Extraire data de la réponse CResponse
  }

  async getApprenantsByCohorte(cohorteId: number, page: number, size: number): Promise<any> {
    const response = await fetchApi<any>(`/apprenants/get-by-cohorte/${cohorteId}/${page}/${size}`, { method: "GET" });
    return response.data || response;
  }

  async createApprenant(apprenantData: Omit<Apprenant, 'id'> & { userId?: number; userEmail?: string }): Promise<any> {
    // Le backend accepte maintenant userId ou userEmail dans ApprenantCreateRequest
    // Structure attendue: { nom, prenom, email, numero, profession, niveauEtude, filiere, attentes, satisfaction, cohorteId, userId?, userEmail? }
    const response = await fetchApi<any>("/apprenants/create", {
      method: "POST",
      body: apprenantData,
    });
    // Le backend retourne CResponse<Apprenant>
    // Structure: { ok: boolean, data: Apprenant, message: string }
    return response.data || response;
  }

  async getApprenantById(id: number): Promise<any> {
    try {
      const response = await fetchApi<any>(`/apprenants/${id}`, { method: "GET" });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching apprenant with ID ${id}:`, error);
      throw error;
    }
  }

  async updateApprenant(id: number, apprenantData: Partial<Apprenant>): Promise<any> {
    const response = await fetchApi<any>(`/apprenants/${id}`, {
      method: "PUT",
      body: apprenantData,
    });
    return response.data || response;
  }

  async deleteApprenant(id: number): Promise<any> {
    const response = await fetchApi<any>(`/apprenants/${id}`, {
      method: "DELETE",
    });
    return response.data || response;
  }

  async getApprenantDashboardSummary(apprenantId: number): Promise<{ coursesEnrolled: number; completedCourses: number; totalCertificates: number; }> {
    console.warn(`ApprenantService: getApprenantDashboardSummary endpoint for apprenantId ${apprenantId} is not defined in t.txt. Returning default empty object.`);
    return { coursesEnrolled: 0, completedCourses: 0, totalCertificates: 0 };
  }

  async getApprenantDetailedProgression(apprenantId: number): Promise<any[]> {
    console.warn(`ApprenantService: getApprenantDetailedProgression endpoint for apprenantId ${apprenantId} is not defined in t.txt. Returning empty array.`);
    return [];
  }

  async getApprenantCertificates(apprenantId: number): Promise<any[]> {
    console.warn(`ApprenantService: getApprenantCertificates endpoint for apprenantId ${apprenantId} is not defined in t.txt. Returning empty array.`);
    return [];
  }
}

export const apprenantService = new ApprenantService();
