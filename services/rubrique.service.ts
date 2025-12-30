import { fetchApi } from './api.service';

export interface ApiRubrique {
  id: number;
  rubrique: string; // Nom de la rubrique
  image: string | null; // URL ou chemin de l'image
  description: string | null; // Description du programme
  objectifs: string | null; // Objectifs principaux
  public_cible: string | null; // Public cible
  duree_format: string | null; // Durée et format de la formation
  lien_ressources: string | null; // Lien vers site ou ressources
}

export class RubriqueService {
  async getAllRubriques(): Promise<ApiRubrique[]> {
    const response = await fetchApi<any>("/rubriques/read", { method: "GET" });
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("API response for /rubriques/read is not in expected format:", response);
      throw new Error("Invalid API response format for rubriques.");
    }
  }

  async createRubrique(rubriqueData: Omit<ApiRubrique, 'id'>, imageFile?: File): Promise<ApiRubrique> {
    const formData = new FormData();
    formData.append("rubrique", JSON.stringify(rubriqueData));
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const response = await fetchApi<any>("/rubriques/save", {
      method: "POST",
      body: formData,
    });
    return response.data || response;
  }

  async updateRubrique(id: number, rubriqueData: Partial<ApiRubrique>, imageFile?: File): Promise<ApiRubrique> {
    const formData = new FormData();
    formData.append("rubrique", JSON.stringify(rubriqueData));
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    const response = await fetchApi<any>(`/rubriques/update/${id}`, {
      method: "PUT",
      body: formData,
    });
    return response.data || response;
  }

  async deleteRubrique(id: number): Promise<void> {
    await fetchApi<any>(`/rubriques/delete/${id}`, {
      method: "DELETE",
    });
  }
}

export const rubriqueService = new RubriqueService();
