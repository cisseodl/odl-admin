import { LabDefinition } from '../models/lab-definition.model';
import { fetchApi } from './api.service';

export class LabDefinitionService {
  async getAllLabDefinitions(): Promise<LabDefinition[]> {
    const response = await fetchApi<any>("/api/labs/", { method: "GET" });
    return response.data;
  }

  // Other methods (getLabDefinitionById, createLabDefinition, updateLabDefinition, deleteLabDefinition)
  // not explicitly defined in test.md GET section.
  async getLabDefinitionById(id: number): Promise<LabDefinition | null> {
    const response = await fetchApi<any>(`/api/labs/${id}`, { method: "GET" });
    return response.data;
  }

  async createLabDefinition(labDefinition: Omit<LabDefinition, 'id'>): Promise<LabDefinition> {
    // Transformer lesson_id en lessonId pour le backend
    const { lesson_id, ...rest } = labDefinition;
    const backendPayload = {
      ...rest,
      lessonId: lesson_id,
    };
    const response = await fetchApi<any>("/api/labs/", {
      method: "POST",
      body: backendPayload,
    });
    return response.data;
  }

  async updateLabDefinition(id: number, labDefinitionData: Partial<LabDefinition>): Promise<LabDefinition | null> {
    // Transformer lesson_id en lessonId pour le backend
    const { lesson_id, ...rest } = labDefinitionData;
    const backendPayload = {
      ...rest,
      ...(lesson_id !== undefined && { lessonId: lesson_id }),
    };
    const response = await fetchApi<any>(`/api/labs/${id}`, {
      method: "PUT",
      body: backendPayload,
    });
    return response.data || response;
  }

  async deleteLabDefinition(id: number): Promise<void> {
    await fetchApi<any>(`/api/labs/${id}`, {
      method: "DELETE",
    });
  }
}

export const labDefinitionService = new LabDefinitionService();
