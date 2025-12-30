import { Question } from '../models/question.model';
import { fetchApi } from './api.service';

export class QuestionService {
  async getAllQuestions(): Promise<Question[]> {
    const response = await fetchApi<any>("/questions/get-all", { method: "GET" });
    return response.data;
  }

  async createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'activate' | 'created_by' | 'modified_by' | 'reponses'>): Promise<Question> {
    const response = await fetchApi<any>("/questions/save", {
      method: "POST",
      body: question,
    });
    return response.data;
  }

  // Other methods (getQuestionById, updateQuestion, deleteQuestion) not explicitly defined in test.md GET section.
  async getQuestionById(id: number): Promise<Question | null> {
    console.log(`Fetching question with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async updateQuestion(id: number, questionData: Partial<Question>): Promise<Question | null> {
    console.log(`Updating question with ID: ${id}`, questionData);
    return null;
  }

  async deleteQuestion(id: number): Promise<void> {
    console.log(`Deleting question with ID: ${id}`);
  }
}

export const questionService = new QuestionService();
