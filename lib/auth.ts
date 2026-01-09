import { fetchApi } from "@/services/api.service";
import { User as UserDb } from "@/models/user-db.model";
import { STORAGE_KEYS } from "@/constants/auth";
import { authService as backendAuthService } from "@/services/auth.service"; // Renommé pour éviter la confusion
import type { User, UserRole } from "@/types"; // Importer User et UserRole depuis @/types

export const authService = {
  async validateToken(): Promise<boolean> {
    // --- ATTENTION: SOLUTION TEMPORAIRE ET NON SÉCURISÉE ---
    // Cet endpoint '/auth/me' n'existe pas encore côté backend.
    // Pour éviter une déconnexion constante pendant le développement,
    // nous considérons le token valide s'il est présent dans le localStorage.
    // Il est CRUCIAL d'implémenter un endpoint '/auth/me' sécurisé côté backend
    // dès que possible. Cet endpoint devrait valider le token auprès du serveur
    // et retourner un succès si le token est valide, ou une erreur 401/403 sinon.
    // Le code ci-dessous doit être remplacé par un appel à un vrai endpoint de validation
    // une fois que le backend est prêt.
    return !!this.getAuthToken();
  },

  async signIn(credentials: any): Promise<{ success: boolean; user: User }> {
    try {
      const response = await backendAuthService.signIn(credentials); // Utiliser backendAuthService
      if (response && response.success && response.data && response.data.token && response.data.user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);

        // Déterminer le rôle et construire l'objet User simplifié
        const rawUser = response.data.user;
        let userRole: UserRole | null = null;
        if (rawUser.admin) {
          userRole = "admin";
        } else if (rawUser.instructor) {
          userRole = "instructor";
        } else if (rawUser.apprenant) {
          userRole = "apprenant";
        }

        if (!userRole) {
          throw new Error("Impossible de déterminer le rôle de l'utilisateur.");
        }

        const simplifiedUser: User = {
          id: String(rawUser.id),
          email: rawUser.email,
          name: rawUser.fullName || rawUser.email,
          role: userRole,
        };

        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(simplifiedUser));
        return { success: true, user: simplifiedUser };
      } else {
        throw new Error(response?.message || "Failed to sign in.");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      throw new Error(error.message || "Authentication failed.");
    }
  },

  signOut() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  },

  getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getUserInfo(): User | null { // Le type de retour est maintenant User
    if (typeof window === "undefined") return null; // Sécurité pour SSR
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },
};