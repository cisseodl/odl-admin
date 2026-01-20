import { Categorie } from "./categorie.model";
import { Course } from "./course.model";

/**
 * Modèle Formation - niveau intermédiaire entre Catégorie et Cours
 * Hiérarchie : Catégorie -> Formation -> Cours -> Module -> Leçon
 */
export interface Formation {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  title: string;
  description?: string | null;
  imagePath?: string | null;
  categorie?: Categorie | null;
  categorie_id?: number | null;
  courses?: Course[] | null;
}

