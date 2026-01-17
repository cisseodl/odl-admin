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
    try {
      const response = await fetchApi<any>(`/api/admin/reports/audit/recent?limit=${limit}`, { method: "GET" });
      const logs = response.data || [];
      // Mapper les ActivityLog du backend vers AuditLog du frontend
      return logs.map((log: any) => {
        let details: Record<string, unknown> | undefined = undefined;
        if (log.details) {
          try {
            details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
          } catch (e) {
            // Si le parsing échoue, garder les détails comme string
            details = { raw: log.details };
          }
        }
        
        // Extraire resourceName depuis details ou resource
        let resourceName: string | undefined = undefined;
        if (details) {
          resourceName = (details.courseTitle as string) || 
                     (details.userName as string) || 
                     (details.title as string) || 
                     log.resource;
        } else {
          resourceName = log.resource;
        }
        
        return {
          id: log.id || 0,
          userId: log.user?.id || 0,
          userName: log.userName || "Utilisateur inconnu",
          action: log.action as AuditAction,
          resource: log.resource as AuditResource,
          resourceId: details?.id as number || details?.courseId as number || undefined,
          resourceName: resourceName,
          details: details,
          createdAt: log.createdAt || log.created_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }
  }

  async getInstructorRecentActivity(instructorId: number, limit: number): Promise<AuditLog[]> { // Nouvelle méthode
    try {
      const response = await fetchApi<any>(`/api/analytics/instructor-activity?instructorId=${instructorId}&limit=${limit}`, { method: "GET" });
      if (!response || !response.data) {
        return [];
      }
      const logs = Array.isArray(response.data) ? response.data : [response.data];
      // Mapper les ActivityLog du backend vers AuditLog du frontend
      return logs.map((log: any) => {
        let details: Record<string, unknown> | undefined = undefined;
        if (log.details) {
          try {
            details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
          } catch (e) {
            details = { raw: log.details };
          }
        }
        
        let resourceName: string | undefined = undefined;
        if (details) {
          resourceName = (details.courseTitle as string) || 
                     (details.userName as string) || 
                     (details.title as string) || 
                     log.resource;
        } else {
          resourceName = log.resource;
        }
        
        return {
          id: log.id || 0,
          userId: log.user?.id || instructorId,
          userName: log.userName || "Utilisateur inconnu",
          action: (log.action || log.activityType || "unknown") as AuditAction,
          resource: (log.resource || "unknown") as AuditResource,
          resourceId: details?.id as number || details?.courseId as number || log.courseId || undefined,
          resourceName: resourceName || log.courseTitle,
          details: details,
          createdAt: log.createdAt || log.timestamp || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error fetching instructor recent activity:", error);
      return [];
    }
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
