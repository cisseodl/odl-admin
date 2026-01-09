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
    // Le backend attend un FormData avec "module" comme JSON stringifié
    const formData = new FormData();
    formData.append("module", JSON.stringify({
      courseId: payload.courseId,
      courseType: payload.courseType || "DEBUTANT",
      modules: payload.modules.map(m => ({
        title: m.title,
        description: m.description || "",
        moduleOrder: m.moduleOrder,
        lessons: m.lessons || [],
      })),
    }));
    
    const response = await fetchApi<any>("/modules/save", {
      method: "POST",
      body: formData,
    });
    return response;
  }

  async getModulesByCourse(courseId: number): Promise<any> {
    const response = await fetchApi<any>(`/modules/course/${courseId}`, {
      method: "GET",
    });
    return response.data || response;
  }
}

export const moduleService = new ModuleService();
