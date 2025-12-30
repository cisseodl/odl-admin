import { fetchApi } from './api.service';

export interface ApiInstructor {
  id: number;
  createdBy: string | null;
  lastModifiedBy: string | null;
  activate: boolean;
  createdAt: string | null;
  lastModifiedAt: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  qualifications: string;
  imagePath: string | null;
}

export class InstructorService {
  async getAllInstructors(): Promise<ApiInstructor[]> {
    const response = await fetchApi<any>("/instructors/read", { method: "GET" });
    
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("API response for /instructors/read is not in expected format:", response);
      throw new Error("Invalid API response format for instructors.");
    }
  }

  async updateInstructor(id: number, instructorData: Partial<ApiInstructor>): Promise<ApiInstructor> {
    const response = await fetchApi<any>(`/instructors/update/${id}`, {
      method: "PUT",
      body: instructorData, // Body should be raw JSON, as per a.txt
    });
    // Assuming the API returns the updated instructor directly in the response.
    // If it returns a wrapper like { data: ApiInstructor }, adjust this line.
    return response.data || response;
  }

  // Potentially add other methods like getInstructorById, createInstructor, updateInstructor, deleteInstructor
}

export const instructorService = new InstructorService();
