import { fetchApi } from "./api.service";

export class LeaderboardService {
  async getOverall(): Promise<any> {
    const response = await fetchApi<any>("/api/v1/leaderboard/overall", {
      method: "GET",
    });
    return response.data || [];
  }

  async getMonthly(): Promise<any> {
    const response = await fetchApi<any>("/api/v1/leaderboard/monthly", {
      method: "GET",
    });
    return response.data || [];
  }

  async getCourseLeaderboard(courseId: number): Promise<any> {
    const response = await fetchApi<any>(
      `/api/v1/leaderboard/course/${courseId}`,
      { method: "GET" }
    );
    return response.data || [];
  }

  async getUserDetails(userId: number): Promise<any> {
    const response = await fetchApi<any>(
      `/api/v1/leaderboard/user/${userId}/details`,
      { method: "GET" }
    );
    return response.data || null;
  }
}

export const leaderboardService = new LeaderboardService();
