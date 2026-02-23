import { Question } from './question.model';

export enum EvaluationType {
  QUIZ = 'QUIZ',
  TP = 'TP'
}

export enum AttemptStatus {
  PENDING = 'PENDING',
  CORRECTED = 'CORRECTED',
  PASSED = 'PASSED',
  FAILED = 'FAILED'
}

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
  type?: EvaluationType;
  courseId?: number;
  course?: { id: number; title: string };
  instructorId?: number;
  instructor?: { id: number; fullName: string; email: string };
  lesson?: { id: number; title: string };
  lessonId?: number;
  tpInstructions?: string | null;
  tpFileUrl?: string | null;
}

export interface EvaluationAttempt {
  id: number;
  evaluationId: number;
  evaluationTitle?: string | null;
  userId: number;
  learnerName?: string | null;
  learnerEmail?: string | null;
  score?: number | null;
  status: AttemptStatus;
  submittedFileUrl?: string | null;
  submittedText?: string | null;
  correctedBy?: number | null;
  correctedAt?: Date | null;
  instructorFeedback?: string | null;
  createdAt?: Date | null;
}
