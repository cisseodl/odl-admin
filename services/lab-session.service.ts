import { LabSession } from '../models/lab-session.model';
import { fetchApi } from './api.service';

export class LabSessionService {
  async getMyLabSessions(): Promise<LabSession[]> {
    const response = await fetchApi<any>("/api/labs/my-sessions", { method: "GET" });
    return response.data;
  }

  async startLabSession(labId: number): Promise<LabSession> {
    const response = await fetchApi<any>(`/api/labs/start/${labId}`, { method: "POST" });
    return response.data;
  }

  async stopLabSession(sessionId: number): Promise<LabSession> {
    const response = await fetchApi<any>(`/api/labs/stop/${sessionId}`, { method: "POST" });
    return response.data;
  }

  async submitLabSession(sessionId: number, reportUrl?: string): Promise<LabSession> {
    const response = await fetchApi<any>(`/api/labs/submit/${sessionId}`, {
      method: "POST",
      body: reportUrl ? { reportUrl } : {},
    });
    return response.data;
  }

  // Other methods (getAllLabSessions, getLabSessionById, createLabSession, updateLabSession, deleteLabSession)
  // not explicitly defined in test.md.
  async getAllLabSessions(): Promise<LabSession[]> {
    console.log('Fetching all labSessions... (No explicit endpoint)');
    return [];
  }

  async getLabSessionById(id: number): Promise<LabSession | null> {
    console.log(`Fetching labSession with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createLabSession(labSession: Omit<LabSession, 'id'>): Promise<LabSession> {
    console.log('Creating a new labSession...', labSession);
    const newLabSession = { id: Math.floor(Math.random() * 1000), ...labSession };
    return newLabSession;
  }

  async updateLabSession(id: number, labSessionData: Partial<LabSession>): Promise<LabSession | null> {
    console.log(`Updating labSession with ID: ${id}`, labSessionData);
    return null;
  }

  async deleteLabSession(id: number): Promise<void> {
    console.log(`Deleting labSession with ID: ${id}`);
  }
}

export const labSessionService = new LabSessionService();
