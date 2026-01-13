import { Categorie } from '../models/categorie.model';
import { fetchApi } from './api.service';

export class CategorieService {
  async getAllCategories(): Promise<any> {
    try {
      const apiResponse = await fetchApi<any>("/api/categories/read", { method: "GET" });
      // Le backend retourne CResponse avec structure { ok, data, message }
      if (apiResponse && apiResponse.data) {
        return Array.isArray(apiResponse.data) ? apiResponse.data : [];
      }
      // Si la réponse est directement un tableau
      if (Array.isArray(apiResponse)) {
        return apiResponse;
      }
      // Si la réponse est null ou undefined, retourner un tableau vide
      if (!apiResponse) {
        console.warn("Categories API returned null or undefined");
        return [];
      }
      // Sinon retourner un tableau vide par défaut pour éviter les erreurs
      console.warn("Unexpected categories response structure:", apiResponse);
      return [];
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      // Retourner un tableau vide en cas d'erreur pour éviter les crashes
      return [];
    }
  }

  async getCategorieById(id: number): Promise<Categorie> {
    const response = await fetchApi<any>(`/api/categories/read/${id}`, { method: "GET" }); // CORRECTION ICI
    return response.data;
  }

  async createCategorie(categorie: Omit<Categorie, 'id' | 'createdAt' | 'updatedAt' | 'activate' | 'created_by' | 'modified_by'>): Promise<Categorie> {
    const response = await fetchApi<any>("/api/categories/save", { // CORRECTION ICI
      method: "POST",
      body: categorie,
    });
    return response.data;
  }

  async updateCategorie(categorie: Categorie): Promise<void> {
    // Selon t.txt, l'endpoint est PUT /api/categories/update, avec l'ID dans le corps.
    await fetchApi<any>("/api/categories/update", { // CORRECTION ICI
      method: "PUT",
      body: categorie, // L'objet catégorie complet avec l'ID
    });
  }

  async deleteCategorie(id: number): Promise<void> {
    await fetchApi<any>(`/api/categories/delete/${id}`, { // CORRECTION ICI
      method: "DELETE",
    });
  }
}

export const categorieService = new CategorieService();
