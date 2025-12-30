import { Quiz } from '../models/quiz.model';
import { fetchApi } from './api.service';

export class QuizService {
  async getQuizzesByCourse(courseId: number): Promise<Quiz[]> {
    const response = await fetchApi<any>(`/quiz/course/${courseId}`, { method: "GET" });
    return response.data;
  }

  async createQuiz(quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'activate' | 'created_by' | 'modified_by' | 'questions'>): Promise<Quiz> {
    const response = await fetchApi<any>("/quiz/create", {
      method: "POST",
      body: quizData,
    });
    return response.data;
  }

  async submitQuiz(quizId: number, answers: Array<{ questionId: number; reponseIds: number[] }>): Promise<any> {
    const response = await fetchApi<any>("/quiz/submit", {
      method: "POST",
      body: { quizId, answers },
    });
    return response.data;
  }

  // Other methods (getAllQuizzes, getQuizById, updateQuiz, deleteQuiz) not explicitly defined in test.md GET section.
  async getAllQuizzes(): Promise<Quiz[]> {
    console.log('Fetching all quizzes... (No explicit endpoint)');
    return [];
  }

  async getQuizById(id: number): Promise<Quiz | null> {
    console.log(`Fetching quiz with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async updateQuiz(id: number, quizData: Partial<Quiz>): Promise<Quiz | null> {
    console.log(`Updating quiz with ID: ${id}`, quizData);
    return null;
  }

  async deleteQuiz(id: number): Promise<void> {
    console.log(`Deleting quiz with ID: ${id}`);
  }
}

export const quizService = new QuizService();
