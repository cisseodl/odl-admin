import { Chapter } from './chapter.model';
import { Apprenant } from './apprenant.model';

export interface LearnerChapter {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  chapter?: Chapter | null;
  learner?: Apprenant | null;
}
