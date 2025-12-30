import { Course } from './course.model';

export interface Chapter {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  chapterLink?: string | null;
  description?: string | null;
  pdfPath?: string | null;
  title?: string | null;
  course?: Course | null;
}
