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
  async getAllCertificatesForAdmin(page: number = 0, size: number = 50): Promise<{
    content: Certificate[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const response = await fetchApi<{ data: { content: Certificate[]; totalElements: number; totalPages: number; page: number; size: number } | Certificate[] }>(
      `/api/certificates/admin/all?page=${page}&size=${size}`,
      { method: 'GET' }
    );
    const data = response.data;
    if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
      return {
        content: data.content,
        totalElements: data.totalElements ?? data.content.length,
        totalPages: data.totalPages ?? 1,
        page: data.page ?? page,
        size: data.size ?? size,
      };
    }
    const list = Array.isArray(data) ? data : [];
    return { content: list, totalElements: list.length, totalPages: 1, page: 0, size: list.length };
  }

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
