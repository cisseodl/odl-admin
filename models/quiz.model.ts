import { Course } from './course.model';
import { QuizQuestion } from './quiz-question.model';

export interface Quiz {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  description?: string | null;
  durationMinutes?: number | null;
  scoreMinimum?: number | null;
  title?: string | null;
  course?: Course | null;
  questions?: QuizQuestion[] | null;
}
