import { Cohorte } from '../models/cohorte.model';
import { fetchApi } from './api.service';

export class CohorteService {
  async getAllCohortes(): Promise<Cohorte[]> {
    const response = await fetchApi<any>("/cohorte/read", { method: "GET" });
    return response.data;
  }

  async getCohorteById(id: number): Promise<Cohorte> {
    const response = await fetchApi<any>(`/cohorte/read/${id}`, { method: "GET" });
    return response.data;
  }

  async createCohorte(cohorte: Omit<Cohorte, 'id' | 'createdAt' | 'updatedAt' | 'activate' | 'created_by' | 'modified_by'>): Promise<Cohorte> {
    const response = await fetchApi<any>("/cohorte/save", {
      method: "POST",
      body: cohorte,
    });
    return response.data;
  }

  async updateCohorte(id: number, cohorteData: Partial<Cohorte>): Promise<Cohorte> {
    const response = await fetchApi<any>(`/cohorte/update/${id}`, {
      method: "PUT",
      body: cohorteData,
    });
    return response.data;
  }

  async deleteCohorte(id: number): Promise<void> {
    await fetchApi<any>(`/cohorte/delete/${id}`, {
      method: "DELETE",
    });
  }
}

export const cohorteService = new CohorteService();
