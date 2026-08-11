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

const BACKEND_LESSON_TYPES = new Set(["VIDEO", "QUIZ", "DOCUMENT", "LAB"]);

function normalizeLessonType(type: string): "VIDEO" | "QUIZ" | "DOCUMENT" | "LAB" {
  const upper = (type || "VIDEO").toUpperCase();
  if (upper === "IMAGE") return "DOCUMENT";
  if (BACKEND_LESSON_TYPES.has(upper)) {
    return upper as "VIDEO" | "QUIZ" | "DOCUMENT" | "LAB";
  }
  return "VIDEO";
}

function buildModulePayload(payload: ModulesPayload) {
  return {
    courseId: payload.courseId,
    courseType: payload.courseType || "DEBUTANT",
    modules: payload.modules.map(m => ({
      ...(m.id != null && { id: m.id }),
      title: m.title,
      description: m.description || "",
      moduleOrder: m.moduleOrder,
      lessons: (m.lessons || []).map((l: any) => ({
        ...(l.id != null && { id: l.id }),
        title: l.title,
        lessonOrder: l.lessonOrder,
        type: normalizeLessonType(l.type),
        ...(l.contentUrl && l.contentUrl.trim() && { contentUrl: l.contentUrl }),
        ...(l.duration && l.duration > 0 && { duration: l.duration }),
      })),
    })),
  };
}

export class ModuleService {
  /** Ajoute un seul module sans supprimer les modules existants du cours. */
  async addModule(payload: ModulesPayload): Promise<any> {
    if (!payload.modules?.length) {
      throw new Error("Au moins un module est requis.");
    }
    try {
      const modulePayload = buildModulePayload({
        ...payload,
        modules: [payload.modules[0]],
      });
      const response = await fetchApi<any>("/modules/add", {
        method: "POST",
        body: modulePayload,
      });
      if (response?.ok === false) {
        throw new Error(response.message || "Erreur lors de l'ajout du module.");
      }
      return response;
    } catch (error: any) {
      console.error("[ModuleService] Erreur dans addModule:", error);
      throw error;
    }
  }

  async saveModules(payload: ModulesPayload): Promise<any> {
    try {
      // Le backend attend un FormData avec "module" comme JSON stringifié
      const modulePayload = buildModulePayload(payload);
      
      const jsonString = JSON.stringify(modulePayload);
      
      const formData = new FormData();
      formData.append("module", new Blob([jsonString], { type: "application/json" }));
      
      const response = await fetchApi<any>("/modules/save", {
        method: "POST",
        body: formData,
      });

      if (response?.ok === false) {
        throw new Error(response.message || "Erreur lors de la sauvegarde des modules.");
      }

      return response;
    } catch (error: any) {
      console.error("[ModuleService] Erreur dans saveModules:", error);
      console.error("[ModuleService] Message d'erreur:", error.message);
      console.error("[ModuleService] Stack:", error.stack);
      throw error;
    }
  }

  /** Ajoute un seul module sans remplacer les existants (évite ConstraintViolation en base). */
  async addModule(payload: ModulesPayload): Promise<any> {
    try {
      if (!payload.modules || payload.modules.length !== 1) {
        throw new Error("addModule attend exactement un module dans payload.modules");
      }
      const body = {
        courseId: payload.courseId,
        courseType: payload.courseType || "DEBUTANT",
        modules: payload.modules.map(m => ({
          title: m.title,
          description: m.description ?? "",
          moduleOrder: m.moduleOrder,
          lessons: (m.lessons || []).map((l: any) => ({
            title: l.title,
            lessonOrder: l.lessonOrder,
            type: l.type,
            ...(l.contentUrl && l.contentUrl.trim() && { contentUrl: l.contentUrl }),
            ...(l.duration && l.duration > 0 && { duration: l.duration }),
          })),
        })),
      };
      const response = await fetchApi<any>("/modules/add", {
        method: "POST",
        body,
      });
      if (response && (response as any).ok === false) {
        throw new Error((response as any).message || "Erreur lors de l'ajout du module.");
      }
      return response;
    } catch (error: any) {
      console.error("[ModuleService] Erreur dans addModule:", error);
      throw error;
    }
  }

  async getModulesByCourse(courseId: number): Promise<any[]> {
    const response = await fetchApi<any>(`/modules/course/${courseId}`, {
      method: "GET",
    });
    if (response && (response as any).ok === false) {
      throw new Error((response as any).message || "Impossible de charger les modules.");
    }
    const data = (response as any)?.data ?? response;
    if (Array.isArray(data)) return data;
    // Fallback: backend peut renvoyer { data: { content: [...] } } ou { modules: [...] }
    if (data && typeof data === "object") {
      if (Array.isArray((data as any).content)) return (data as any).content;
      if (Array.isArray((data as any).modules)) return (data as any).modules;
    }
    return [];
  }
}

export const moduleService = new ModuleService();
