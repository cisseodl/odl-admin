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
    // Transformer les champs snake_case en camelCase pour le backend
    const { 
      lesson_id, 
      estimated_duration_minutes,
      max_duration_minutes,
      uploaded_files,
      resource_links,
      ...rest 
    } = labDefinition;
    
    // Convertir en nombres et valider
    const estimatedDuration = Number(estimated_duration_minutes);
    const maxDuration = Number(max_duration_minutes);
    const lessonId = Number(lesson_id);
    
    // S'assurer que les champs requis sont présents et valides
    if (!estimated_duration_minutes || isNaN(estimatedDuration) || estimatedDuration <= 0) {
      throw new Error("La durée estimée est requise et doit être supérieure à 0");
    }
    if (!max_duration_minutes || isNaN(maxDuration) || maxDuration <= 0) {
      throw new Error("La durée maximale est requise et doit être supérieure à 0");
    }
    if (!lesson_id || isNaN(lessonId) || lessonId <= 0) {
      throw new Error("La leçon est requise");
    }
    
    const backendPayload: any = {
      title: rest.title || "",
      description: rest.description || "",
      instructions: rest.instructions || "",
      lessonId: lessonId,
      estimatedDurationMinutes: estimatedDuration,
      maxDurationMinutes: maxDuration,
      activate: rest.activate !== undefined ? rest.activate : true,
    };
    
    // Ajouter les champs optionnels seulement s'ils sont définis
    if (uploaded_files !== undefined && uploaded_files !== null && uploaded_files !== "") {
      backendPayload.uploadedFiles = uploaded_files;
    }
    if (resource_links !== undefined && resource_links !== null && resource_links !== "") {
      backendPayload.resourceLinks = resource_links;
    }
    
    console.log("[LabDefinitionService] Sending payload to API:", backendPayload);
    
    const response = await fetchApi<any>("/api/labs/", {
      method: "POST",
      body: backendPayload,
    });
    return response.data;
  }

  async updateLabDefinition(id: number, labDefinitionData: Partial<LabDefinition>): Promise<LabDefinition | null> {
    // Transformer les champs snake_case en camelCase pour le backend
    const { 
      lesson_id,
      estimated_duration_minutes,
      max_duration_minutes,
      uploaded_files,
      resource_links,
      ...rest 
    } = labDefinitionData;
    
    const backendPayload: any = {
      ...rest,
    };
    
    if (lesson_id !== undefined) {
      backendPayload.lessonId = lesson_id;
    }
    if (estimated_duration_minutes !== undefined) {
      backendPayload.estimatedDurationMinutes = estimated_duration_minutes;
    }
    if (max_duration_minutes !== undefined) {
      backendPayload.maxDurationMinutes = max_duration_minutes;
    }
    if (uploaded_files !== undefined) {
      backendPayload.uploadedFiles = uploaded_files;
    }
    if (resource_links !== undefined) {
      backendPayload.resourceLinks = resource_links;
    }
    
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
