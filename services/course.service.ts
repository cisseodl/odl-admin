import { Course } from "../models/course.model";
import { fetchApi } from "./api.service";
import { Categorie } from "@/models"; // Import Categorie model
import { UserDb } from "@/models/user-db.model"; // Import UserDb for instructor

export class CourseService {
  async getAllCourses(filters: { status?: string } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    if (filters.status) {
      // Mapper les statuts frontend vers backend
      const statusMap: Record<string, string> = {
        'IN_REVIEW': 'BROUILLON',
        'DRAFT': 'BROUILLON',
        'PUBLISHED': 'PUBLIE',
        'ARCHIVED': 'ARCHIVE',
      };
      const backendStatus = statusMap[filters.status] || filters.status;
      queryParams.append("status", backendStatus);
    }
    const endpoint = `/courses/read?${queryParams.toString()}`;
    const apiResponse = await fetchApi<any>(endpoint, { method: "GET" });
    // Le backend retourne CResponse avec structure { ok, data, message }
    return apiResponse.data || apiResponse;
  }

  async getCourseById(id: number): Promise<Course> {
    try {
      const response = await fetchApi<any>(`/courses/read/${id}`, { // Corrected endpoint assumption
        method: "GET",
      });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      throw new Error(`Failed to fetch course with ID ${id}.`);
    }
  }

  async getCoursesByPage(page: number, size: number): Promise<any> {
    const response = await fetchApi<any>(`/api/courses/page/${page}/${size}`, { // CORRECTION ICI
      method: "GET",
    });
    return response.data;
  }

  async getCoursesByCategory(catId: number): Promise<any> {
    const response = await fetchApi<any>(`/api/courses/read/by-category/${catId}`, { // CORRECTION ICI
      method: "GET",
    });
    return response;
  }

  async getCoursesByInstructorId(instructorId: number): Promise<Course[]> {
    const response = await fetchApi<any>(`/courses/read/by-instructor/${instructorId}`, { // Endpoint corrigé
      method: "GET",
    });
    // Le backend retourne CResponse avec structure { ok, data, message }
    // Extraire les données de la réponse
    if (Array.isArray(response)) {
      return response;
    } else if (response && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    } else {
      console.error(
        "API response for /api/courses/read/by-instructor is not in expected format:",
        response
      );
      throw new Error("Invalid API response format for instructor courses.");
    }
  }

  async createCourse(
    catId: number,
    courseData: any,
    imageFile?: File
  ): Promise<Course> {
    const formData = new FormData();
    formData.append("courses", JSON.stringify(courseData));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetchApi<any>(`/courses/save/${catId}`, {
      method: "POST",
      body: formData,
    });
    // Le backend retourne CResponse avec structure { ok, data, message }
    // data contient le CourseDto créé
    return response.data || response;
  }

  async updateCourse(
    id: number,
    courseData: any,
    imageFile?: File
  ): Promise<any> {
    const formData = new FormData();
    formData.append("courses", JSON.stringify(courseData));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetchApi<any>(`/api/courses/${id}`, { // CORRECTION ICI
      method: "PUT",
      body: formData,
    });
    return response.data || response;
  }

  async deleteCourse(id: number): Promise<void> {
    await fetchApi<any>(`/api/courses/delete/${id}`, { // CORRECTION ICI
      method: "DELETE",
    });
  }

  async validateCourse(courseId: number, action: "APPROVE" | "REJECT", reason?: string): Promise<any> {
    const payload: { action: string; reason?: string } = { action };
    if (reason && reason.trim()) {
      payload.reason = reason;
    }
    const response = await fetchApi<any>(`/courses/${courseId}/validate`, {
      method: "POST",
      body: payload,
    });
    return response.data || response;
  }

  async enrollInCourse(courseId: number): Promise<any> { // Nouvelle méthode
    const response = await fetchApi<any>(`/courses/enroll/${courseId}`, {
      method: "POST",
    });
    return response.data || response;
  }

  async unenrollUserFromCourse(courseId: number, userId: number): Promise<void> {
    await fetchApi<any>(`/courses/unenroll/${courseId}/user/${userId}`, {
      method: "DELETE",
    });
  }
}

export const courseService = new CourseService();
