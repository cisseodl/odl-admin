import { Question } from './question.model';

export interface Evaluation {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  description?: string | null;
  imagePath?: string | null;
  status?: string | null;
  title?: string | null;
  questions?: Question[] | null;
}
