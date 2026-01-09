import { Evaluation } from '../models/evaluation.model';
import { fetchApi } from './api.service';

export class EvaluationService {
  async getAllEvaluations(): Promise<Evaluation[]> {
    const response = await fetchApi<any>("/evaluations/get-all", { method: "GET" });
    return response.data;
  }

  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt' | 'activate' | 'created_by' | 'modified_by'>): Promise<Evaluation> {
    const response = await fetchApi<any>("/evaluations/save", {
      method: "POST",
      body: evaluation,
    });
    return response.data;
  }

  // Other methods (getEvaluationById, updateEvaluation, deleteEvaluation) not explicitly defined in test.md GET section.
  async getEvaluationById(id: number): Promise<Evaluation | null> {
    console.log(`Fetching evaluation with ID: ${id}... (Not an explicit endpoint)`);
    return null;
  }

  async updateEvaluation(id: number, evaluationData: Partial<Evaluation>): Promise<Evaluation> {
    const response = await fetchApi<any>(`/evaluations/update/${id}`, {
      method: "PUT",
      body: evaluationData,
    });
    return response.data || response;
  }

  async deleteEvaluation(id: number): Promise<void> {
    await fetchApi<any>(`/evaluations/delete/${id}`, {
      method: "DELETE",
    });
  }
}

export const evaluationService = new EvaluationService();
