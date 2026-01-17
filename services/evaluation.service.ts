import { Evaluation, EvaluationAttempt, EvaluationType } from '../models/evaluation.model';
import { fetchApi } from './api.service';

export interface EvaluationRequest {
  title: string;
  description?: string;
  courseId: number;
  type: EvaluationType;
  tpInstructions?: string;
  tpFileUrl?: string;
}

export interface EvaluationSubmissionRequest {
  evaluationId: number;
  submittedFileUrl?: string; // Pour les TPs
  answers?: Record<number, number>; // Pour les QUIZ: questionId -> responseId
  textAnswers?: Record<number, string>; // Pour les QUIZ avec réponses libres: questionId -> réponse texte
}

export interface EvaluationCorrectionRequest {
  attemptId: number;
  score: number; // 0-100
  feedback?: string;
}

export class EvaluationService {
  async getAllEvaluations(): Promise<Evaluation[]> {
    const response = await fetchApi<any>("/evaluations/get-all", { method: "GET" });
    return response.data || response;
  }

  async createEvaluation(request: EvaluationRequest): Promise<Evaluation> {
    const response = await fetchApi<any>("/evaluations/create", {
      method: "POST",
      body: request,
    });
    return response.data || response;
  }

  async submitEvaluation(request: EvaluationSubmissionRequest): Promise<EvaluationAttempt> {
    const response = await fetchApi<any>("/evaluations/submit", {
      method: "POST",
      body: request,
    });
    return response.data || response;
  }

  async correctEvaluation(request: EvaluationCorrectionRequest): Promise<EvaluationAttempt> {
    const response = await fetchApi<any>("/evaluations/correct", {
      method: "POST",
      body: request,
    });
    return response.data || response;
  }

  async getAttemptsByEvaluationAndUser(evaluationId: number, userId: number): Promise<EvaluationAttempt[]> {
    const response = await fetchApi<any>(`/evaluations/${evaluationId}/attempts/${userId}`, {
      method: "GET",
    });
    return response.data || response;
  }

  async getPendingEvaluationsForInstructor(instructorId: number): Promise<EvaluationAttempt[]> {
    const response = await fetchApi<any>(`/evaluations/instructor/${instructorId}/pending`, {
      method: "GET",
    });
    return response.data || response;
  }

  async getEvaluationById(id: number): Promise<Evaluation | null> {
    try {
      const response = await fetchApi<any>(`/evaluations/get-all`, { method: "GET" });
      const evaluations = response.data || response;
      return Array.isArray(evaluations) ? evaluations.find((e: Evaluation) => e.id === id) || null : null;
    } catch (error) {
      console.error(`Error fetching evaluation with ID ${id}:`, error);
      return null;
    }
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
