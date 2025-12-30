import type { User, UserRole } from "@/types" // Keep User from types/index.ts for frontend context
import { User as UserDb } from "@/models/user-db.model" // Import the DB user model
import { STORAGE_KEYS } from "@/constants/auth"
import { authApiService } from "@/services/auth.service" // Import the new authApiService

export const authService = {
  /**
   * Effectue la connexion de l'utilisateur via l'API et sauvegarde les données localement.
   * @param credentials - Les identifiants de connexion (email, password).
   * @returns Les données utilisateur complètes après connexion.
   */
  async login(credentials: { email: string; password: string }): Promise<User> {
    const response = await authApiService.signIn(credentials);
    const apiUser = response.data.user as UserDb;
    const token = response.data.token;

    // Map UserDb to frontend User type
    const user: User = {
      id: apiUser.id?.toString(), // Ensure ID is string as per frontend User type
      email: apiUser.email || "",
      role: (apiUser.role?.toLowerCase() as UserRole) || "admin", // Default to admin if role is missing
      name: apiUser.fullName || "",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token); // Save token
    }
    return user;
  },

  /**
   * Enregistre un nouvel utilisateur via l'API et sauvegarde les données localement.
   * @param userData - Les données de l'utilisateur à enregistrer.
   * @param avatarFile - Le fichier avatar (optionnel).
   * @returns Les données de l'utilisateur créé.
   */
  async signup(userData: any, avatarFile?: File): Promise<User> {
    const response = await authApiService.signUp(userData, avatarFile);
    const apiUser = response.data.user as UserDb;
    const token = response.data.token;

    // Map UserDb to frontend User type
    const user: User = {
      id: apiUser.id?.toString(),
      email: apiUser.email || "",
      role: (apiUser.role?.toLowerCase() as UserRole) || "admin",
      name: apiUser.fullName || "",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token); // Save token
    }
    return user;
  },

  /**
   * Sauvegarde l'utilisateur dans le localStorage
   */
  saveUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    }
  },

  /**
   * Récupère l'utilisateur depuis le localStorage
   */
  getUser(): User | null {
    if (typeof window === "undefined") return null
    
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN) // Get token
      if (!storedUser || !storedToken) return null // User is not authenticated if no user or token

      const user = JSON.parse(storedUser) as User;
      // You might want to validate the token here if needed
      return user
    } catch (error) {
      console.error("Error parsing user from localStorage:", error)
      return null
    }
  },

  /**
   * Supprime l'utilisateur du localStorage
   */
  removeUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.TOKEN) // Remove token
    }
    // Redirect to login page after logout
    window.location.href = "/login";
  },

  /**
   * Vérifie si un utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.getUser() !== null && (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.TOKEN) !== null);
  },
}

