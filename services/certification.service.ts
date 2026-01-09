import { fetchApi } from "./api.service";

// Define the Certification type temporarily here, as no global model was found.
// Ideally, this should come from a central `models/` or `types/` folder.
export type Certification = {
  id: number
  name: string
  course: string // Assuming course name, not object
  issued: number
  validUntil: string
  status: "Actif" | "Expiré" | "En attente"
  requirements: string
}


export class CertificationService {
  async getAllCertifications(): Promise<Certification[]> {
    console.warn("Certifications: getAllCertifications endpoint is not defined in t.txt. Returning empty array.");
    // No API call is made as the endpoint is not defined.
    return [];
  }

  async createCertification(certification: Omit<Certification, 'id' | 'issued'>): Promise<Certification> {
    const response = await fetchApi<any>("/certifications", {
      method: "POST",
      body: certification,
    });
    return response.data;
  }

  async updateCertification(id: number, certification: Partial<Certification>): Promise<Certification> {
    const response = await fetchApi<any>(`/certifications/${id}`, {
      method: "PUT",
      body: certification,
    });
    return response.data || response;
  }

  async deleteCertification(id: number): Promise<void> {
    await fetchApi<any>(`/certifications/${id}`, {
      method: "DELETE",
    });
  }
}

export const certificationService = new CertificationService();
