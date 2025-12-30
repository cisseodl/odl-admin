import { Reponse } from '../models/reponse.model';
import { fetchApi } from './api.service';

export class ReponseService {
  async getAllReponses(): Promise<Reponse[]> {
    const response = await fetchApi<any>("/reponses/get-all", { method: "GET" });
    return response.data;
  }

  async createReponse(reponse: Omit<Reponse, 'id' | 'createdAt' | 'updatedAt' | 'activate' | 'created_by' | 'modified_by'>): Promise<Reponse> {
    const response = await fetchApi<any>("/reponses/save", {
      method: "POST",
      body: reponse,
    });
    return response.data;
  }

  // Other methods (getReponseById, updateReponse, deleteReponse) not explicitly defined in test.md GET section.
  async getReponseById(id: number): Promise<Reponse | null> {
    console.log(`Fetching reponse with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async updateReponse(id: number, reponseData: Partial<Reponse>): Promise<Reponse | null> {
    console.log(`Updating reponse with ID: ${id}`, reponseData);
    return null;
  }

  async deleteReponse(id: number): Promise<void> {
    console.log(`Deleting reponse with ID: ${id}`);
  }
}

export const reponseService = new ReponseService();
