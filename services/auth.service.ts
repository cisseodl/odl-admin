// services/auth.service.ts
import { fetchApi } from "./api.service";

export class AuthService {
  async signIn(credentials: { email: string; password: string }): Promise<any> {
    return fetchApi("/auth/signin", {
      method: "POST",
      body: credentials,
    });
  }

  async signUp(userData: any, avatarFile?: File): Promise<any> {
    const formData = new FormData();
    formData.append("user", JSON.stringify(userData));
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    return fetchApi("/auth/signup", {
      method: "POST",
      body: formData,
    });
  }

  // Add other authentication related methods as needed (e.g., changePassword)
  async forgetPassword(username: string): Promise<any> { // Nouvelle méthode
    return fetchApi(`/auth/forget-pass/${username}`, {
      method: "GET",
    });
  }

  // Adapter changePassword pour correspondre à la spécification du backend
  async changePassword(passwordData: { username: string, token: string, password: string }): Promise<any> {
    // Le token du backend est passé dans le body, pas dans les headers pour cet endpoint.
    // L'endpoint `POST /auth/change-pass` attend `username`, `token`, `password` dans le JSON body.
    return fetchApi("/auth/change-pass", {
      method: "POST",
      body: passwordData, // Le body contient déjà username, token, password
    });
  }

  async createLearnerByAdmin(cohorteId: number, learnerData: any, photoFile?: File, token?: string): Promise<any> {
    const formData = new FormData();
    formData.append("learner", JSON.stringify(learnerData));
    if (photoFile) {
      formData.append("photo", photoFile);
    }
    return fetchApi(`/auth/create-learner/${cohorteId}`, {
      method: "POST",
      body: formData,
      token: token
    });
  }
}

export const authService = new AuthService();
