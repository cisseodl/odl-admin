import { fetchApi } from "./api.service";
import { Badge, BadgeAward } from "@/types/gamification"; // Import types

export class GamificationService {
  async getAllBadges(): Promise<Badge[]> {
    const response = await fetchApi<any>("/gamification/badges", { method: "GET" });
    return response.data || response;
  }

  async createBadge(badge: Omit<Badge, 'id' | 'createdAt' | 'awardedCount'>): Promise<Badge> {
    const response = await fetchApi<any>("/gamification/badges", {
      method: "POST",
      body: badge,
    });
    return response.data;
  }

  async updateBadge(id: number, badge: Partial<Badge>): Promise<Badge> {
    const response = await fetchApi<any>(`/gamification/badges/${id}`, {
      method: "PUT",
      body: badge,
    });
    return response.data || response;
  }

  async deleteBadge(id: number): Promise<void> {
    await fetchApi<any>(`/gamification/badges/${id}`, {
      method: "DELETE",
    });
  }

  async getBadgeAwards(): Promise<BadgeAward[]> {
    const response = await fetchApi<any>("/gamification/awards", { method: "GET" });
    return response.data || response;
  }
}

export const gamificationService = new GamificationService();
