import { Apprenant } from '../models/apprenant.model';
import { fetchApi } from './api.service';

export class ApprenantService {
  async getAllApprenants(): Promise<any> {
    try {
      const response = await fetchApi<any>("/api/apprenants/get-all", { method: "GET" });
      // Backend retourne CResponse avec structure { ok: boolean, data: Apprenant[], message: string }
      if (!response || !response.data) {
        return [];
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error("Error fetching apprenants:", error);
      return [];
    }
  }

  async getApprenantsByCohorte(cohorteId: number, page: number, size: number): Promise<any> {
    const response = await fetchApi<any>(`/apprenants/get-by-cohorte/${cohorteId}/${page}/${size}`, { method: "GET" });
    return response.data || response;
  }

  async createApprenant(apprenantData: { username?: string; userId?: number; userEmail?: string; numero?: string; profession?: string; niveauEtude?: string; filiere?: string; attentes?: string; satisfaction?: boolean; cohorteId?: number; activate?: boolean }): Promise<any> {
    // Le backend accepte maintenant username au lieu de nom/prenom/email dans ApprenantCreateRequest
    // Structure attendue: { username, numero, profession, niveauEtude, filiere, attentes, satisfaction, cohorteId, userId?, userEmail?, activate? }
    const response = await fetchApi<any>("/api/apprenants/create", {
      method: "POST",
      body: apprenantData,
    });
    // Le backend retourne CResponse<Apprenant>
    // Structure: { ok: boolean, data: Apprenant, message: string }
    return response.data || response;
  }

  async getApprenantById(id: number): Promise<any> {
    try {
      const response = await fetchApi<any>(`/api/apprenants/${id}`, { method: "GET" });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching apprenant with ID ${id}:`, error);
      throw error;
    }
  }

  async updateApprenant(id: number, apprenantData: Partial<Apprenant>): Promise<any> {
    // Le backend attend un User dans le body ET des query params pour les champs Apprenant
    const userBody = {
      fullName: apprenantData.nom && apprenantData.prenom 
        ? `${apprenantData.prenom} ${apprenantData.nom}`.trim()
        : undefined,
      email: apprenantData.email,
      phone: apprenantData.numero,
      activate: apprenantData.activate,
    };

    // Construire les query params pour les champs spécifiques à Apprenant
    const queryParams = new URLSearchParams();
    if (apprenantData.nom) queryParams.append("nom", apprenantData.nom);
    if (apprenantData.prenom) queryParams.append("prenom", apprenantData.prenom);
    if (apprenantData.email) queryParams.append("email", apprenantData.email);
    if (apprenantData.numero) queryParams.append("numero", apprenantData.numero);
    if (apprenantData.profession) queryParams.append("profession", apprenantData.profession);
    if (apprenantData.niveauEtude) queryParams.append("niveauEtude", apprenantData.niveauEtude);
    if (apprenantData.filiere) queryParams.append("filiere", apprenantData.filiere);
    if (apprenantData.attentes) queryParams.append("attentes", apprenantData.attentes);
    if (apprenantData.satisfaction !== undefined) queryParams.append("satisfaction", String(apprenantData.satisfaction));
    // Gérer cohorteId depuis l'objet cohorte ou directement
    const cohorteId = (apprenantData.cohorte as any)?.id || (apprenantData as any).cohorteId;
    if (cohorteId) queryParams.append("cohorteId", String(cohorteId));

    const response = await fetchApi<any>(`/apprenants/${id}?${queryParams.toString()}`, {
      method: "PUT",
      body: userBody,
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
