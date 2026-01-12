import type { User } from "@/types"

export const DEMO_USERS: Array<User & { password: string }> = [
  {
    email: "admin@elearning.com",
    password: "admin123",
    role: "admin",
    name: "Administrateur",
  },
  {
    email: "instructor@elearning.com",
    password: "instructor123",
    role: "instructor",
    name: "Formateur",
  },
]

export const STORAGE_KEYS = {
  USER: "user",
  USER_INFO: "userInfo", // Clé pour les informations utilisateur simplifiées
  TOKEN: "token",
  AUTH_TOKEN: "token", // Alias pour compatibilité avec lib/auth.ts
} as const

