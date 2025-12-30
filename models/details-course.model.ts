export interface DetailsCourse {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  courseStatut?: number | null;
  course_id?: number | null;
  learner_id?: number | null;
}
