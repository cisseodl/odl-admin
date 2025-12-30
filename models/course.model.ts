import { Categorie } from './categorie.model';

export interface Course {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  courseType?: number | null;
  description?: string | null;
  duration?: number | null;
  imagePath?: string | null;
  price?: number | null;
  title?: string | null;
  categorie?: Categorie | null;
}
