import { Reponse } from './reponse.model';
import { Evaluation } from './evaluation.model';

export interface Question {
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
  type?: string | null;
  reponses?: Reponse[] | null;
  evaluations?: Evaluation | null;
}
