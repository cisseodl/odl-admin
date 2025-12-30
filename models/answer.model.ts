export interface Answer {
  id: number;
  activate: boolean;
  created_at?: Date | null;
  created_by?: string | null;
  last_modified_at?: Date | null;
  modified_by?: string | null;
  infoTest_id?: number | null;
  question_id?: number | null;
  reponse_id?: number | null;
}
