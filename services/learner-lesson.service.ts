import { fetchApi } from "./api.service";

export class LearnerLessonService {
  async completeLesson(
    courseId: number,
    lessonId: number,
    token?: string
  ): Promise<any> {
    const response = await fetchApi<any>(
      `/api/learn/${courseId}/lessons/${lessonId}/complete`,
      {
        method: "POST",
        token,
      }
    );
    return response.data || response;
  }

  async getCourseProgress(courseId: number, token?: string): Promise<any> {
    const response = await fetchApi<any>(`/api/learn/${courseId}`, {
      method: "GET",
      token,
    });
    return response.data || response;
  }
}

export const learnerLessonService = new LearnerLessonService();
