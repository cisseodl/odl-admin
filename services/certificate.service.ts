import { fetchApi } from './api.service';

export interface Certificate {
  id: number;
  uniqueCode: string;
  studentName: string;
  studentEmail: string;
  course: string;
  courseId: number;
  issuedDate: string;
  validUntil?: string;
  status: "Valide" | "Expiré";
  certificateUrl?: string;
  avatar?: string;
}

class CertificateService {
  async getCertificatesByInstructor(instructorId: number): Promise<Certificate[]> {
    const response = await fetchApi<{ data: Certificate[] }>(
      `/api/certificates/instructor/${instructorId}`,
      { method: 'GET' }
    );
    return response.data || [];
  }

  /** Tous les apprenants certifiés (admin). */
  async getAllCertificatesForAdmin(): Promise<Certificate[]> {
    const response = await fetchApi<{ data: Certificate[] }>(
      '/api/certificates/admin/all',
      { method: 'GET' }
    );
    return response.data || [];
  }

  async downloadCertificate(certificateUrl: string): Promise<void> {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  }
}

export const certificateService = new CertificateService();
