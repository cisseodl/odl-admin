import { Cohorte } from './cohorte.model';

export interface Apprenant {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  email?: string | null;
  filiere?: string | null;
  niveauEtude?: string | null;
  nom?: string | null;
  numero?: string | null;
  prenom?: string | null;
  profession?: string | null;
  cohorte?: Cohorte | null;
  // Champs depuis ApprenantWithUserDto
  username?: string | null; // Nom complet construit depuis prenom + nom
  fullName?: string | null; // Nom complet depuis User
  userEmail?: string | null; // Email depuis User
  userId?: number | null;
  avatar?: string | null;
}
