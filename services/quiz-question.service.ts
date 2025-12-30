import { QuizQuestion } from '../models/quiz-question.model';
import { fetchApi } from './api.service';

export class QuizQuestionService {
  // No explicit endpoints for quiz_question in test.md. Keeping as stubs.
  async getAllQuizQuestions(): Promise<QuizQuestion[]> {
    console.log('Fetching all quizQuestions... (No explicit endpoint)');
    return [];
  }

  async getQuizQuestionById(id: number): Promise<QuizQuestion | null> {
    console.log(`Fetching quizQuestion with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createQuizQuestion(quizQuestion: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> {
    console.log('Creating a new quizQuestion...', quizQuestion);
    const newQuizQuestion = { id: Math.floor(Math.random() * 1000), ...quizQuestion };
    return newQuizQuestion;
  }

  async updateQuizQuestion(id: number, quizQuestionData: Partial<QuizQuestion>): Promise<QuizQuestion | null> {
    console.log(`Updating quizQuestion with ID: ${id}`, quizQuestionData);
    return null;
  }

  async deleteQuizQuestion(id: number): Promise<void> {
    console.log(`Deleting quizQuestion with ID: ${id}`);
  }
}

export const quizQuestionService = new QuizQuestionService();
