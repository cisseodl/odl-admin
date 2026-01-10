import { fetchApi } from './api.service';
import { UserDb } from '@/models/user-db.model'; // Assuming instructor update might involve UserDb fields

// Interface pour InstructorRequest du backend
export interface InstructorRequest {
  biography?: string;
  specialization?: string;
}

// Interface pour InstructorWithUserDto du backend (avec jointure JPA)
export interface ApiInstructor {
  id: number;
  createdAt?: string;
  lastModifiedAt?: string;
  activate?: boolean;
  biography?: string;
  specialization?: string;
  // Données User directement dans le DTO (pas dans un sous-objet user)
  userId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  userActivate?: boolean;
}

export class InstructorService {
  async getAllInstructors(): Promise<any> {
    const response = await fetchApi<any>("/instructors/get-all", { method: "GET" });
    // Backend retourne CResponse avec structure { ok: boolean, data: Instructor[], message: string }
    // Mais peut aussi retourner directement un tableau
    if (Array.isArray(response)) {
      return { data: response };
    }
    return response.data || response;
  }

  async getInstructorById(id: number): Promise<any> {
    try {
      const response = await fetchApi<any>(`/instructors/${id}`, { method: "GET" });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching instructor with ID ${id}:`, error);
      throw error;
    }
  }

  async updateInstructor(id: number, instructorData: Partial<ApiInstructor & UserDb>): Promise<any> {
    // Le backend attend un InstructorUpdateRequest avec biography, specialization et les champs User
    const requestBody = {
      biography: instructorData.biography,
      specialization: instructorData.specialization,
      fullName: instructorData.fullName || (instructorData.firstName && instructorData.lastName 
        ? `${instructorData.firstName} ${instructorData.lastName}`.trim()
        : undefined),
      email: instructorData.email,
      phone: instructorData.phone,
      avatar: instructorData.avatar,
      activate: instructorData.activate,
    };

    const response = await fetchApi<any>(`/instructors/${id}`, {
      method: "PUT",
      body: requestBody,
    });
    return response.data || response;
  }

  async promoteUserAndCreateInstructorProfile(
    userId: number,
    instructorProfileData: { biography?: string; specialization?: string }
  ): Promise<any> {
    // Le backend accepte maintenant userId dans InstructorRequest pour permettre aux admins
    // de créer un profil instructor pour un autre utilisateur
    const payload: InstructorRequest = {
      userId: userId,
      biography: instructorProfileData.biography,
      specialization: instructorProfileData.specialization,
    };
    
    const response = await fetchApi<any>("/instructors/create", {
      method: "POST",
      body: payload,
    });
    
    // Le backend retourne CResponse<Instructor>
    // Structure: { ok: boolean, data: Instructor, message: string }
    return response.data || response;
  }

  async deleteInstructor(id: number): Promise<any> {
    const response = await fetchApi<any>(`/instructors/${id}`, {
      method: "DELETE",
    });
    return response.data || response;
  }
}

export const instructorService = new InstructorService();
