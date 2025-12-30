import { UserDb } from './user-db.model';
import { LabDefinition } from './lab-definition.model';

export interface LabSession {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  containerUrl?: string | null;
  endTime?: Date | null;
  grade?: string | null;
  reportUrl?: string | null;
  startTime?: Date | null;
  status: string;
  labDefinition?: LabDefinition | null;
  user?: UserDb | null;
}
