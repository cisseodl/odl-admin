// services/learner.service.ts
import { fetchApi } from './api.service';
import { LearnerChapter } from '@/models/learner-chapter.model'; // Assuming this model exists for progression

export class LearnerService {
  async markLessonAsCompleted(courseId: number, lessonId: number): Promise<void> {
    await fetchApi<any>(`/api/learn/${courseId}/lessons/${lessonId}/complete`, {
      method: "POST",
    });
  }

  async getCourseProgression(courseId: number): Promise<LearnerChapter[]> {
    const response = await fetchApi<any>(`/api/learn/${courseId}`, {
      method: "GET",
    });
    return response.data || response;
  }
}

export const learnerService = new LearnerService();
