import { Categorie } from "./categorie.model";
import { Module } from "./module.model";
// // import { Module } from "./module.model";
import { User } from "./user-db.model";

export interface Course {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  imagePath?: string | null;
  duration?: number | null; // seconds
  level?: string | null; // CourseLevel enum as string
  language?: string | null;
  bestseller?: boolean | null;
  objectives?: string[] | null;
  features?: string[] | null;
  modules?: Module[] | null;
  status?: string | null; // CourseStatus as string
  rejectionReason?: string | null;
  price?: number | null;
  categorie?: Categorie | null;
  instructor?: User | null;
}
