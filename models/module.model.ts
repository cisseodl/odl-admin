import { Course } from "./course.model";
import { Lesson } from "./lesson.model";

export interface Module {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  title?: string | null;
  description?: string | null;
  moduleOrder?: number | null;
  course?: Course | null;
  lessons?: Lesson[] | null;
}
