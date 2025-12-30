import { Evaluation } from './evaluation.model';

export interface InfoTest {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  evaluations?: Evaluation | null;
}
