export interface User {
  id: number;
  activate?: boolean | null;
  admin?: boolean | null;
  avatar?: string | null;
  email?: string | null;
  fullName?: string | null;
  password?: string | null;
  phone?: string | null;
  role?: string | null;
  learner_id?: number | null;
  createdAt?: string | Date | null;
  roles?: string[]; // Liste des rôles (ADMIN, INSTRUCTOR, APPRENANT, USER)
  certificates?: string[]; // Liste des certificats
}

// Alias pour compatibilité
export type UserDb = User;
