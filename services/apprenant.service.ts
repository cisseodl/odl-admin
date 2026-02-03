import { Apprenant } from '../models/apprenant.model';
import { fetchApi } from './api.service';

export class ApprenantService {
  /**
   * Apprenants inscrits aux cours de l'instructeur connecté (dashboard instructeur).
   * Utilise GET /api/apprenants/by-instructor (autorisé INSTRUCTOR et ADMIN).
   */
  async getApprenantsByInstructor(): Promise<any> {
    try {
      const response = await fetchApi<any>("/api/apprenants/by-instructor", { method: "GET" });
      if (!response || !response.data) {
        return [];
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      console.error("Error fetching apprenants by instructor:", error);
      throw error;
    }
  }

  async getAllApprenants(): Promise<any> {
    try {
      // Essayer d'abord avec le nouveau endpoint /api/apprenants/get-all
      const response = await fetchApi<any>("/api/apprenants/get-all", { method: "GET" });
      // Backend retourne CResponse avec structure { ok: boolean, data: Apprenant[], message: string }
      if (!response || !response.data) {
        console.warn("[ApprenantService] Response data is empty or null");
        return [];
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error: any) {
      // Si erreur 404, essayer l'ancien endpoint sans /api (compatibilité)
      if (error.message && error.message.includes("404")) {
        console.warn("[ApprenantService] 404 avec /api/apprenants/get-all, tentative avec l'ancien endpoint /apprenants/get-all");
        try {
          const fallbackResponse = await fetchApi<any>("/apprenants/get-all", { method: "GET" });
          if (!fallbackResponse || !fallbackResponse.data) {
            return [];
          }
          return Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [fallbackResponse.data];
        } catch (fallbackError: any) {
          console.error("[ApprenantService] Erreur également avec l'ancien endpoint:", fallbackError);
          console.error("[ApprenantService] Le backend doit être redéployé avec le nouveau mapping /api/apprenants");
          return [];
        }
      }
      console.error("Error fetching apprenants:", error);
      return [];
    }
  }

  async getApprenantsByCohorte(cohorteId: number, page: number, size: number): Promise<any> {
    try {
      const response = await fetchApi<any>(`/api/apprenants/get-by-cohorte/${cohorteId}/${page}/${size}`, { method: "GET" });
      return response.data || response;
    } catch (error) {
      console.error("Error fetching apprenants by cohorte:", error);
      return [];
    }
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

  async updateApprenant(id: number, apprenantData: { username?: string; numero?: string; profession?: string; niveauEtude?: string; filiere?: string; attentes?: string; satisfaction?: boolean; cohorteId?: number; userDetails?: { fullName?: string; email?: string; phone?: string; activate?: boolean } }): Promise<any> {
    // Le backend attend un User dans le body ET des query params pour les champs Apprenant
    const userBody = apprenantData.userDetails || {};

    // Construire les query params pour les champs spécifiques à Apprenant
    const queryParams = new URLSearchParams();
    if (apprenantData.username) queryParams.append("username", apprenantData.username);
    if (apprenantData.numero) queryParams.append("numero", apprenantData.numero);
    if (apprenantData.profession) queryParams.append("profession", apprenantData.profession);
    if (apprenantData.niveauEtude) queryParams.append("niveauEtude", apprenantData.niveauEtude);
    if (apprenantData.filiere) queryParams.append("filiere", apprenantData.filiere);
    if (apprenantData.attentes) queryParams.append("attentes", apprenantData.attentes);
    if (apprenantData.satisfaction !== undefined) queryParams.append("satisfaction", String(apprenantData.satisfaction));
    if (apprenantData.cohorteId) queryParams.append("cohorteId", String(apprenantData.cohorteId));

    const response = await fetchApi<any>(`/api/apprenants/${id}?${queryParams.toString()}`, {
      method: "PUT",
      body: userBody,
    });
    return response.data || response;
  }

  async deleteApprenant(id: number): Promise<any> {
    try {
      const response = await fetchApi<any>(`/api/apprenants/${id}`, {
        method: "DELETE",
      });
      return response.data || response;
    } catch (error: any) {
      console.error(`Error deleting apprenant with ID ${id}:`, error);
      throw error;
    }
  }

  async getApprenantDashboardSummary(apprenantId: number): Promise<{ coursesEnrolled: number; completedCourses: number; totalCertificates: number; }> {
    try {
      const response = await fetchApi<any>(`/api/apprenants/${apprenantId}/stats`, { method: "GET" });
      
      // Le backend retourne CResponse avec structure { ok: boolean, data: {...}, message: string }
      if (response && response.ok && response.data) {
        // response.data peut être directement l'objet stats ou dans response.data.data
        const stats = response.data.data || response.data;
        
        if (stats && typeof stats === 'object') {
          return {
            coursesEnrolled: stats.coursesEnrolled ?? 0,
            completedCourses: stats.completedCourses ?? 0,
            totalCertificates: stats.totalCertificates ?? 0,
          };
        }
      }
      
      console.warn(`ApprenantService: getApprenantDashboardSummary failed for apprenantId ${apprenantId}`, {
        ok: response?.ok,
        hasData: !!response?.data,
        message: response?.message,
        data: response?.data
      });
      return { coursesEnrolled: 0, completedCourses: 0, totalCertificates: 0 };
    } catch (error: any) {
      console.error(`ApprenantService: Error fetching stats for apprenantId ${apprenantId}:`, error);
      return { coursesEnrolled: 0, completedCourses: 0, totalCertificates: 0 };
    }
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
