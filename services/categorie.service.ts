import { Categorie } from '../models/categorie.model';
import { fetchApi } from './api.service';

export class CategorieService {
  async getAllCategories(): Promise<any> {
    const apiResponse = await fetchApi<any>("/api/categories/read", { method: "GET" });
    return apiResponse;
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
