import { Course } from '../models/course.model';
import { fetchApi } from './api.service';

export class CourseService {
  async getAllCourses(): Promise<Course[]> {
    const apiResponse = await fetchApi<any>("/courses/read", { method: "GET" });
    // Assuming apiResponse is directly the array of courses based on the log "Array(1)"
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    } else if (apiResponse && apiResponse.data) {
      // If it's wrapped in a 'data' property (as per test.md example)
      return apiResponse.data;
    } else {
      console.error("API response for /courses/read is not in expected format (missing 'data' property or not an array):", apiResponse);
      throw new Error("Invalid API response format for courses.");
    }
  }

  async getCourseById(id: number): Promise<Course> {
    const response = await fetchApi<any>(`/courses/read/${id}`, { method: "GET" });
    return response.data;
  }

  async getCoursesByPage(page: number, size: number): Promise<any> {
    const response = await fetchApi<any>(`/courses/page/${page}/${size}`, { method: "GET" });
    return response.data;
  }

  async getCoursesByCategory(catId: number): Promise<Course[]> {
    const response = await fetchApi<any>(`/courses/read/by-category/${catId}`, { method: "GET" });
    return response.data;
  }

  async createCourse(catId: number, courseData: any, imageFile?: File): Promise<Course> {
    const formData = new FormData();
    formData.append("courses", JSON.stringify(courseData));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetchApi<any>(`/courses/save/${catId}`, {
      method: "POST",
      body: formData,
    });
    return response.data;
  }

  async updateCourse(courseData: any, imageFile?: File): Promise<void> {
    const formData = new FormData();
    formData.append("courses", JSON.stringify(courseData));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    await fetchApi<any>("/courses/update", {
      method: "PUT",
      body: formData,
    });
  }

  async deleteCourse(id: number): Promise<void> {
    await fetchApi<any>(`/courses/delete/${id}`, {
      method: "DELETE",
    });
  }
}

export const courseService = new CourseService();
