export interface Cohorte {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  description?: string | null;
  nom?: string | null;
}
