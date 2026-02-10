import { DetailsCourse } from '../models/details-course.model';
import { fetchApi } from './api.service';

export class DetailsCourseService {
  // No explicit endpoints for details_course in test.md. Keeping as stubs.
  async getAllDetailsCourses(): Promise<DetailsCourse[]> {
    console.log('Fetching all detailsCourses... (No explicit endpoint)');
    return [];
  }

  async getDetailsCourseById(id: number): Promise<DetailsCourse | null> {
    console.log(`Fetching detailsCourse with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createDetailsCourse(detailsCourse: Omit<DetailsCourse, 'id'>): Promise<DetailsCourse> {
    console.log('Creating a new detailsCourse...', detailsCourse);
    const newDetailsCourse = { id: Math.floor(Math.random() * 1000), ...detailsCourse };
    return newDetailsCourse;
  }

  async updateDetailsCourse(id: number, detailsCourseData: Partial<DetailsCourse>): Promise<DetailsCourse | null> {
    console.log(`Updating detailsCourse with ID: ${id}`, detailsCourseData);
    return null;
  }

  async deleteDetailsCourse(id: number): Promise<void> {
    console.log(`Deleting detailsCourse with ID: ${id}`);
  }

  async getDetailsByCourseId(courseId: number): Promise<any> {
    try {
      const response = await fetchApi<any>(`/details-course/course/${courseId}`, {
        method: "GET",
      });
      // Le backend retourne CResponse avec structure { ok, data, message }
      if (response && response.data !== undefined) {
        return Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      }
      // Si la réponse est directement un tableau
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching details for course ${courseId}:`, error);
      return [];
    }
  }
}

export const detailsCourseService = new DetailsCourseService();
