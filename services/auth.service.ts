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
  async changePassword(passwordData: any, token: string): Promise<any> {
    return fetchApi("/auth/change-pass", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: passwordData,
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

export const authApiService = new AuthService();
