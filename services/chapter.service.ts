import { Chapter } from '../models/chapter.model';
import { fetchApi } from './api.service';

export class ChapterService {
  async getChaptersByCourse(courseId: number): Promise<Chapter[]> {
    const response = await fetchApi<any>(`/chapters/course/${courseId}`, { method: "GET" });
    return response.data;
  }

  async createChapter(chapterData: any): Promise<Chapter> {
    const formData = new FormData();
    formData.append("chapter", JSON.stringify(chapterData));
    // Assuming chapterData might include courseId and courseType directly, or it's part of the JSON.
    // test.md example: {"courseId": "{{course_gratuit_id}}", "courseType": "REGISTER", "chapters": [{"title": "Chapitre 1: Introduction", "description": "Configuration de l'environnement."}]}
    // The API seems to expect a JSON string for 'chapter' field in FormData.
    const response = await fetchApi<any>("/chapters/save", {
      method: "POST",
      body: formData,
    });
    return response.data;
  }

  // Other methods (getChapterById, updateChapter, deleteChapter) not explicitly defined in test.md GET section.
  // They will remain as stubs or be implemented if corresponding endpoints are found later.
  async getAllChapters(): Promise<Chapter[]> {
    console.log('Fetching all chapters... (Not an explicit endpoint)');
    return [];
  }

  async getChapterById(id: number): Promise<Chapter | null> {
    console.log(`Fetching chapter with ID: ${id}... (Not an explicit endpoint)`);
    return null;
  }

  async updateChapter(id: number, chapterData: Partial<Chapter>): Promise<Chapter | null> {
    console.log(`Updating chapter with ID: ${id}`, chapterData);
    return null;
  }

  async deleteChapter(id: number): Promise<void> {
    console.log(`Deleting chapter with ID: ${id}`);
  }
}

export const chapterService = new ChapterService();
