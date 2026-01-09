import { fetchApi } from "./api.service";
import { AuditLog, AuditFilter } from "@/types/audit"; // Import types
import { Course } from "@/models/course.model"; // Import Course model

// Type for moderation summary statistics
export interface ModerationSummary {
  contents: { pending: number; approved: number; rejected: number; };
  courses: { pending: number; approved: number; rejected: number; };
  reviews: { pending: number; approved: number; rejected: number; };
  instructors: { pending: number; approved: number; rejected: number; };
}

export class AuditService {
  async getAuditLogs(filter?: AuditFilter): Promise<AuditLog[]> {
    // This would typically involve sending filter params to the API
    const response = await fetchApi<any>("/api/audit/logs", {
      method: "GET",
      // body: filter // If filter needs to be in body for POST, or query params for GET
    });
    return response.data || response;
  }

  async getRecentActivity(limit: number): Promise<AuditLog[]> {
    const response = await fetchApi<any>(`/api/admin/reports/audit/logs?page=0&size=${limit}`, { method: "GET" });
    return response.data.content || []; // Extraire le contenu de la pagination
  }

  async getInstructorRecentActivity(instructorId: number, limit: number): Promise<AuditLog[]> { // Nouvelle méthode
    const response = await fetchApi<any>(`/api/audit/instructor-activity?instructorId=${instructorId}&limit=${limit}`, { method: "GET" });
    return response.data || response;
  }

  async getModerationSummary(): Promise<ModerationSummary> {
    try {
      const response = await fetchApi<any>("/api/analytics/moderation/summary", { method: "GET" });
      return response.data || { contents: { pending: 0, approved: 0, rejected: 0 }, courses: { pending: 0, approved: 0, rejected: 0 }, reviews: { pending: 0, approved: 0, rejected: 0 }, instructors: { pending: 0, approved: 0, rejected: 0 } };
    } catch (error) {
      console.error("Error fetching moderation summary:", error);
      return { contents: { pending: 0, approved: 0, rejected: 0 }, courses: { pending: 0, approved: 0, rejected: 0 }, reviews: { pending: 0, approved: 0, rejected: 0 }, instructors: { pending: 0, approved: 0, rejected: 0 } };
    }
  }

  async getPendingCoursesForModeration(): Promise<Course[]> { // Nouvelle méthode
    const response = await fetchApi<any>("/api/moderation/courses/pending", { method: "GET" });
    return response.data || response;
  }

  async approveCourse(courseId: number): Promise<void> { // Nouvelle méthode
    await fetchApi<any>(`/api/moderation/courses/${courseId}/approve`, { method: "POST" });
  }

  async rejectCourse(courseId: number, reason: string): Promise<void> { // Nouvelle méthode
    await fetchApi<any>(`/api/moderation/courses/${courseId}/reject`, { method: "POST", body: { reason } });
  }

  async requestChangesCourse(courseId: number, comment: string): Promise<void> { // Nouvelle méthode
    await fetchApi<any>(`/api/moderation/courses/${courseId}/request-changes`, { method: "POST", body: { comment } });
  }

  async approveContent(contentId: number): Promise<void> {
    await fetchApi<any>(`/api/moderation/content/${contentId}/approve`, { method: "POST" });
  }

  async rejectContent(contentId: number, reason: string): Promise<void> {
    await fetchApi<any>(`/api/moderation/content/${contentId}/reject`, { method: "POST", body: { reason } });
  }
  // ... similar methods for courses, reviews, instructors
}

export const auditService = new AuditService();
