// services/module.service.ts
import { fetchApi } from './api.service';
import type { ModuleFormData } from '@/lib/validations/course-builder';

// This payload structure is based on the ModuleAndCoursePayload in the backend
export interface ModulesPayload {
  courseId: number;
  courseType?: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE"; // CourseLevel enum
  modules: Array<{
    id?: number; // ID du module si déjà créé
    title: string;
    description?: string;
    moduleOrder: number;
    lessons?: Array<{
      title: string;
      lessonOrder: number;
      type: "VIDEO" | "QUIZ" | "DOCUMENT" | "LAB"; // LessonType enum
      contentUrl?: string;
      duration?: number; // Duration in minutes
    }>;
  }>;
}

export class ModuleService {
  async saveModules(payload: ModulesPayload): Promise<any> {
    try {
      // Le backend attend un FormData avec "module" comme JSON stringifié
      const modulePayload = {
        courseId: payload.courseId,
        courseType: payload.courseType || "DEBUTANT",
        modules: payload.modules.map(m => ({
          title: m.title, // @NotBlank - requis
          description: m.description || "", // Reverted: Ensure empty string if empty or null
          moduleOrder: m.moduleOrder, // @NotNull - requis
          lessons: (m.lessons || []).map((l: any) => ({
            title: l.title, // @NotBlank - requis
            lessonOrder: l.lessonOrder, // @NotNull - requis
            type: l.type, // @NotNull - requis (VIDEO, QUIZ, DOCUMENT, LAB)
            ...(l.contentUrl && l.contentUrl.trim() && { contentUrl: l.contentUrl }), // Optionnel
            ...(l.duration && l.duration > 0 && { duration: l.duration }), // Optionnel, en minutes
          })),
        })),
      };
      
      const jsonString = JSON.stringify(modulePayload);
      
      const formData = new FormData();
      formData.append("module", new Blob([jsonString], { type: "application/json" }));
      
      const response = await fetchApi<any>("/modules/save", {
        method: "POST",
        body: formData,
      });
      
      return response;
    } catch (error: any) {
      console.error("[ModuleService] Erreur dans saveModules:", error);
      console.error("[ModuleService] Message d'erreur:", error.message);
      console.error("[ModuleService] Stack:", error.stack);
      throw error;
    }
  }

  async getModulesByCourse(courseId: number): Promise<any> {
    const response = await fetchApi<any>(`/modules/course/${courseId}`, {
      method: "GET",
    });
    return response.data || response;
  }
}

export const moduleService = new ModuleService();
