import { QuizQuestion } from './quiz-question.model';

export interface QuizReponse {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  isCorrect?: boolean | null;
  text?: string | null;
  question?: QuizQuestion | null;
}
