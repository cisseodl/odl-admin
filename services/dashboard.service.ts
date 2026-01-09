import { fetchApi } from "./api.service";
import { analyticsService, ComparisonStatsData, AdminDashboardAnalytics } from "./analytics.service"; // Corrected import

// Type pour le résumé du tableau de bord instructeur
export interface InstructorDashboardSummary {
  totalCourses: number;
  totalStudents: number;
  completionRate: number; // Pourcentage
  certificatesIssued: number;
}

export class DashboardService {
  async getStudentStats(): Promise<any> {
    const response = await fetchApi<any>("/api/dashboard/student", {
      method: "GET",
    });
    return response.data || response;
  }

  async getInstructorStats(): Promise<any> {
    const response = await fetchApi<any>("/api/dashboard/instructor", {
      method: "GET",
    });
    return response.data || response;
  }

  async getInstructorSummary(): Promise<InstructorDashboardSummary> { // Renommé pour clarté
    const response = await fetchApi<any>("/api/dashboard/instructor", {
      method: "GET",
    });
    return response.data || response;
  }

  async getAdminSummary(): Promise<ComparisonStatsData[]> { // Corrected return type
    // Leveraging analyticsService.getComparisonStats for a general admin summary
    const response = await analyticsService.getComparisonStats(); // Removed arguments
    return response;
  }

  async getGlobalStatsSummary(): Promise<AdminDashboardAnalytics> { // Corrected return type
    const response = await analyticsService.getAdminDashboardAnalytics(); // Corrected method call
    return response;
  }
}

export const dashboardService = new DashboardService();
