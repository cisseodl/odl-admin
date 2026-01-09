// services/rubrique.service.ts
import { fetchApi } from './api.service';
import { Rubrique } from '@/models/rubrique.model';

export class RubriqueService {
  async getAllRubriques(): Promise<any> {
    const response = await fetchApi<any>("/api/v1/rubriques/read", { method: "GET" });
    return response;
  }

  async getRubriqueById(id: number): Promise<any> {
    const response = await fetchApi<any>(`/api/v1/rubriques/read/${id}`, { method: "GET" });
    return response;
  }

  async createRubrique(rubriqueData: Omit<Rubrique, 'id'>, imageFile?: File): Promise<any> {
    const formData = new FormData();
    formData.append("rubrique", JSON.stringify(rubriqueData));
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const response = await fetchApi<any>("/api/v1/rubriques/save", {
      method: "POST",
      body: formData,
    });
    return response;
  }

  async updateRubrique(id: number, rubriqueData: Partial<Omit<Rubrique, 'id'>>, imageFile?: File): Promise<any> {
    const formData = new FormData();
    formData.append("rubrique", JSON.stringify(rubriqueData));
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const response = await fetchApi<any>(`/api/v1/rubriques/update/${id}`, {
      method: "PUT",
      body: formData,
    });
    return response;
  }

  async deleteRubrique(id: number): Promise<any> {
    const response = await fetchApi<any>(`/api/v1/rubriques/delete/${id}`, {
      method: "DELETE",
    });
    return response;
  }
}

export const rubriqueService = new RubriqueService();