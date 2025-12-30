import { LearnerChapter } from '../models/learner-chapter.model';
import { fetchApi } from './api.service';

export class LearnerChapterService {
  async saveLearnerChapter(userId: number, chapitreId: number, coursId: number): Promise<LearnerChapter> {
    const formData = new URLSearchParams();
    formData.append("userId", userId.toString());
    formData.append("chapitreId", chapitreId.toString());
    formData.append("coursId", coursId.toString());

    const response = await fetchApi<any>("/learnerchapter/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    return response.data;
  }

  // Other methods (getAllLearnerChapters, getLearnerChapterById, createLearnerChapter, updateLearnerChapter, deleteLearnerChapter)
  // not explicitly defined in test.md.
  async getAllLearnerChapters(): Promise<LearnerChapter[]> {
    console.log('Fetching all learnerChapters... (No explicit endpoint)');
    return [];
  }

  async getLearnerChapterById(id: number): Promise<LearnerChapter | null> {
    console.log(`Fetching learnerChapter with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createLearnerChapter(learnerChapter: Omit<LearnerChapter, 'id'>): Promise<LearnerChapter> {
    console.log('Creating a new learnerChapter...', learnerChapter);
    const newLearnerChapter = { id: Math.floor(Math.random() * 1000), ...learnerChapter };
    return newLearnerChapter;
  }

  async updateLearnerChapter(id: number, learnerChapterData: Partial<LearnerChapter>): Promise<LearnerChapter | null> {
    console.log(`Updating learnerChapter with ID: ${id}`, learnerChapterData);
    return null;
  }

  async deleteLearnerChapter(id: number): Promise<void> {
    console.log(`Deleting learnerChapter with ID: ${id}`);
  }
}

export const learnerChapterService = new LearnerChapterService();
