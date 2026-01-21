import { Evaluation, EvaluationAttempt, EvaluationType } from '../models/evaluation.model';
import { fetchApi } from './api.service';

export interface QuestionRequest {
  title: string;
  description?: string;
  type?: string; // SINGLE_CHOICE, MULTIPLE_CHOICE
  points?: number;
  reponses?: ResponseRequest[];
}

export interface ResponseRequest {
  title: string;
  description?: string;
  isCorrect: boolean;
}

export interface EvaluationRequest {
  title: string;
  description?: string;
  courseId: number;
  type: EvaluationType;
  lessonId?: number; // ID de la leçon associée
  tpInstructions?: string;
  tpFileUrl?: string;
  questions?: QuestionRequest[]; // Questions pour les QUIZ
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
    try {
      const response = await fetchApi<any>("/api/evaluations/get-all", { method: "GET" });
      if (!response) {
        console.warn("getAllEvaluations: API response is null or undefined");
        return [];
      }
      if (response.data !== undefined) {
        return Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      }
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error("Error fetching evaluations:", error);
      return [];
    }
  }

  async createEvaluation(request: EvaluationRequest): Promise<Evaluation> {
    const response = await fetchApi<any>("/api/evaluations/create", {
      method: "POST",
      body: request,
    });
    if (!response) {
      throw new Error("La réponse de l'API est vide");
    }
    return response.data || response;
  }

  async submitEvaluation(request: EvaluationSubmissionRequest): Promise<EvaluationAttempt> {
    const response = await fetchApi<any>("/api/evaluations/submit", {
      method: "POST",
      body: request,
    });
    if (!response) {
      throw new Error("La réponse de l'API est vide");
    }
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
    try {
      const response = await fetchApi<any>(`/api/evaluations/${evaluationId}/attempts/${userId}`, {
        method: "GET",
      });
      if (!response) {
        console.warn("getAttemptsByEvaluationAndUser: API response is null or undefined");
        return [];
      }
      if (response.data !== undefined) {
        return Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      }
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error("Error fetching attempts:", error);
      return [];
    }
  }

  async getPendingEvaluationsForInstructor(instructorId: number): Promise<EvaluationAttempt[]> {
    try {
      const response = await fetchApi<any>(`/api/evaluations/instructor/${instructorId}/pending`, {
        method: "GET",
      });
      if (!response) {
        console.warn("getPendingEvaluationsForInstructor: API response is null or undefined");
        return [];
      }
      if (response.data !== undefined) {
        return Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      }
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error("Error fetching pending evaluations:", error);
      return [];
    }
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
    const response = await fetchApi<any>(`/api/evaluations/update/${id}`, {
      method: "PUT",
      body: evaluationData,
    });
    if (!response) {
      throw new Error("La réponse de l'API est vide");
    }
    return response.data || response;
  }

  async deleteEvaluation(id: number): Promise<void> {
    await fetchApi<any>(`/api/evaluations/delete/${id}`, {
      method: "DELETE",
    });
  }
}

export const evaluationService = new EvaluationService();
