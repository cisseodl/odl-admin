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
    console.log(`Fetching labDefinition with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createLabDefinition(labDefinition: Omit<LabDefinition, 'id'>): Promise<LabDefinition> {
    console.log('Creating a new labDefinition...', labDefinition);
    const newLabDefinition = { id: Math.floor(Math.random() * 1000), ...labDefinition };
    return newLabDefinition;
  }

  async updateLabDefinition(id: number, labDefinitionData: Partial<LabDefinition>): Promise<LabDefinition | null> {
    console.log(`Updating labDefinition with ID: ${id}`, labDefinitionData);
    return null;
  }

  async deleteLabDefinition(id: number): Promise<void> {
    console.log(`Deleting labDefinition with ID: ${id}`);
  }
}

export const labDefinitionService = new LabDefinitionService();
