import { QuizReponse } from '../models/quiz-reponse.model';
import { fetchApi } from './api.service';

export class QuizReponseService {
  // No explicit endpoints for quiz_reponse in test.md. Keeping as stubs.
  async getAllQuizReponses(): Promise<QuizReponse[]> {
    console.log('Fetching all quizReponses... (No explicit endpoint)');
    return [];
  }

  async getQuizReponseById(id: number): Promise<QuizReponse | null> {
    console.log(`Fetching quizReponse with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createQuizReponse(quizReponse: Omit<QuizReponse, 'id'>): Promise<QuizReponse> {
    console.log('Creating a new quizReponse...', quizReponse);
    const newQuizReponse = { id: Math.floor(Math.random() * 1000), ...quizReponse };
    return newQuizReponse;
  }

  async updateQuizReponse(id: number, quizReponseData: Partial<QuizReponse>): Promise<QuizReponse | null> {
    console.log(`Updating quizReponse with ID: ${id}`, quizReponseData);
    return null;
  }

  async deleteQuizReponse(id: number): Promise<void> {
    console.log(`Deleting quizReponse with ID: ${id}`);
  }
}

export const quizReponseService = new QuizReponseService();
