import { LabSession } from './lab-session.model';

export interface LabDefinition {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  description?: string | null;
  uploaded_files?: string | null; // JSON array de chemins/URLs
  resource_links?: string | null; // JSON array d'URLs
  estimated_duration_minutes?: number | null;
  instructions?: string | null;
  title: string;
  sessions?: LabSession[] | null;
}
