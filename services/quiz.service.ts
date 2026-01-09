// services/quiz.service.ts
import { fetchApi } from './api.service';
import { Quiz } from '@/models/quiz.model';

export interface QuizPayload {
  title: string;
  courseId: number;
  durationMinutes: number;
  scoreMinimum: number;
  questions: Array<{
    content: string;
    type: "QCM" | "TEXTE";
    points: number;
    reponses: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export class QuizService {
  async createQuiz(payload: QuizPayload): Promise<Quiz> {
    const response = await fetchApi<any>("/quiz/create", {
      method: "POST",
      body: payload,
    });
    return response.data || response;
  }

  async getQuizById(quizId: number): Promise<Quiz> {
    const response = await fetchApi<any>(`/quiz/${quizId}`, {
      method: "GET",
    });
    return response.data || response;
  }

  async getQuizzesByCourseId(courseId: number): Promise<Quiz[]> {
    try {
      const response = await fetchApi<any>(`/quiz/course/${courseId}`, { method: "GET" });
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching quizzes for course ID ${courseId}:`, error);
      return [];
    }
  }

  async submitQuiz(payload: { quizId: number; answers: Array<{ questionId: number; reponseIds: number[] }> }): Promise<any> {
    const response = await fetchApi<any>("/quiz/submit", {
      method: "POST",
      body: payload,
    });
    return response.data || response;
  }
}

export const quizService = new QuizService();