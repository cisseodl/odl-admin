// services/lesson.service.ts
import { fetchApi } from './api.service';
import { Lesson } from '@/models/lesson.model';

export class LessonService {
  /**
   * Récupère toutes les leçons pour un cours donné
   * @param courseId ID du cours
   * @returns Liste des leçons avec leurs modules
   */
  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    try {
      const modulesResponse = await fetchApi<any>(`/modules/course/${courseId}`, {
        method: "GET",
      });
      
      const modules = Array.isArray(modulesResponse?.data) 
        ? modulesResponse.data 
        : (Array.isArray(modulesResponse) ? modulesResponse : []);
      
      // Extraire toutes les leçons de tous les modules
      const lessons: Lesson[] = [];
      modules.forEach((module: any) => {
        if (module.lessons && Array.isArray(module.lessons)) {
          module.lessons.forEach((lesson: any) => {
            lessons.push({
              ...lesson,
              module: module, // Garder la référence au module
            });
          });
        }
      });
      
      return lessons;
    } catch (error: any) {
      console.error("Error fetching lessons by course:", error);
      return [];
    }
  }

  /**
   * Récupère toutes les leçons créées par l'instructeur connecté
   * @param instructorId ID de l'instructeur (optionnel, peut être extrait du token)
   * @returns Liste de toutes les leçons
   */
  async getAllLessonsForInstructor(): Promise<Lesson[]> {
    try {
      // Récupérer tous les cours de l'instructeur
      const coursesResponse = await fetchApi<any>(`/courses/instructor/my-courses`, {
        method: "GET",
      });
      
      const courses = Array.isArray(coursesResponse?.data)
        ? coursesResponse.data
        : (Array.isArray(coursesResponse) ? coursesResponse : []);
      
      // Récupérer toutes les leçons de tous les cours
      const allLessons: Lesson[] = [];
      
      for (const course of courses) {
        const lessons = await this.getLessonsByCourse(course.id);
        allLessons.push(...lessons);
      }
      
      return allLessons;
    } catch (error: any) {
      console.error("Error fetching all lessons for instructor:", error);
      return [];
    }
  }
}

export const lessonService = new LessonService();

