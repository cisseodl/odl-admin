import { Quiz } from './quiz.model';
import { UserDb } from './user-db.model';

export interface UserQuizAttempt {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  submissionDate?: Date | null;
  score?: number | null;
  scoreTotal?: number | null;
  maxScore?: number | null;
  passed?: boolean | null;
  quiz?: Quiz | null;
  user?: UserDb | null;
}
