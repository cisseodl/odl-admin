import { Course } from "../models/course.model";
import { fetchApi } from "./api.service";
import { Categorie } from "@/models"; // Import Categorie model
import { UserDb } from "@/models/user-db.model"; // Import UserDb for instructor

export class CourseService {
  async getAllCourses(filters: { status?: string | string[] } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      // Admin : Tous (pas de param) / Publié (status=PUBLIE) / Non publié (status=BROUILLON&status=IN_REVIEW)
      if (filters.status !== undefined && filters.status !== null) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        statuses.forEach((s) => queryParams.append("status", s));
      }
      const endpoint = `/courses/read?${queryParams.toString()}`;
      const apiResponse = await fetchApi<any>(endpoint, { method: "GET" });
      // Le backend retourne CResponse avec structure { ok, data, message }
      if (!apiResponse) {
        console.warn("getAllCourses: API response is null or undefined");
        return [];
      }
      if (apiResponse.data !== undefined) {
        return Array.isArray(apiResponse.data) ? apiResponse.data : (apiResponse.data ? [apiResponse.data] : []);
      }
      return Array.isArray(apiResponse) ? apiResponse : [];
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      return [];
    }
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

  async getCoursesByCategory(catId: number, filters: { status?: string } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    if (filters.status) {
      queryParams.append("status", filters.status);
    }
    const endpoint = `/api/courses/read/by-category/${catId}?${queryParams.toString()}`;
    const response = await fetchApi<any>(endpoint, {
      method: "GET",
    });
    return response;
  }

  async getCoursesByInstructorId(instructorId: number): Promise<Course[]> {
    try {
      const response = await fetchApi<any>(`/courses/read/by-instructor/${instructorId}`, {
        method: "GET",
      });
      // Le backend retourne CResponse avec structure { ok, data, message }
      if (!response) {
        console.warn("getCoursesByInstructorId: API response is null or undefined");
        return [];
      }
      // Extraire les données de la réponse
      if (Array.isArray(response)) {
        return response;
      } else if (response.data !== undefined) {
        return Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      } else {
        console.warn("API response for /courses/read/by-instructor is not in expected format:", response);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching courses by instructor ID:", error);
      return [];
    }
  }

  async createCourse(
    catId: number,
    courseData: any,
    imageFile?: File
  ): Promise<Course> {
    const formData = new FormData();
    
    // Utiliser seulement categoryId (plus de formationId)
    const payload = {
      ...courseData,
      categoryId: catId,
      formationId: undefined, // Ne plus utiliser formationId
    };
    
    formData.append("courses", new Blob([JSON.stringify(payload)], { type: "application/json" }));
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

    const response = await fetchApi<any>(`/courses/${id}`, { // Fixed: removed /api/ prefix
      method: "PUT",
      body: formData,
    });
    return response.data || response;
  }

  async deleteCourse(id: number): Promise<void> {
    await fetchApi<any>(`/courses/delete/${id}`, {
      method: "DELETE",
    });
  }

  async validateCourse(courseId: number, action: "APPROVE" | "REJECT" | "WITHDRAW", reason?: string): Promise<any> {
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
