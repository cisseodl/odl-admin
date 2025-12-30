import { QuizReponse } from './quiz-reponse.model';
import { Quiz } from './quiz.model';

export interface QuizQuestion {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  content?: string | null;
  points?: number | null;
  type?: string | null;
  reponses?: QuizReponse[] | null;
  quiz?: Quiz | null;
}
