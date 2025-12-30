import { Categorie } from '../models/categorie.model';
import { fetchApi } from './api.service';

export class CategorieService {
  async getAllCategories(): Promise<Categorie[]> {
    const apiResponse = await fetchApi<any>("/categorie/read", { method: "GET" });
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    } else if (apiResponse && apiResponse.data) {
      return apiResponse.data;
    } else {
      console.error("API response for /categorie/read is not in expected format (missing 'data' property or not an array):", apiResponse);
      throw new Error("Invalid API response format for categories.");
    }
  }

  async getCategorieById(id: number): Promise<Categorie> {
    const response = await fetchApi<any>(`/categorie/read/${id}`, { method: "GET" });
    return response.data;
  }

  async createCategorie(categorie: Omit<Categorie, 'id' | 'createdAt' | 'updatedAt' | 'activate' | 'created_by' | 'modified_by'>): Promise<Categorie> {
    const response = await fetchApi<any>("/categorie/save", {
      method: "POST",
      body: categorie,
    });
    return response.data;
  }

  async updateCategorie(categorie: Categorie): Promise<void> {
    await fetchApi<any>("/categorie/update", {
      method: "PUT",
      body: categorie,
    });
  }

  async deleteCategorie(id: number): Promise<void> {
    await fetchApi<any>(`/categorie/delete/${id}`, {
      method: "DELETE",
    });
  }
}

export const categorieService = new CategorieService();
