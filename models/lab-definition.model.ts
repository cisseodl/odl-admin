import { LabSession } from './lab-session.model';

export interface LabDefinition {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  description?: string | null;
  docker_image_name?: string | null;
  estimated_duration_minutes?: number | null;
  instructions?: string | null;
  title: string;
  sessions?: LabSession[] | null;
}
