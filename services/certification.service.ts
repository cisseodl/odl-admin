import { certificateService } from "./certificate.service";

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
  async getAllCertifications(page: number = 0, size: number = 50): Promise<Certification[]> {
    const result = await certificateService.getAllCertificatesForAdmin(page, size);
    return result.content.map(cert => ({
      id: cert.id,
      name: cert.uniqueCode,
      course: cert.course,
      issued: 1,
      validUntil: cert.validUntil || "",
      status: cert.status === "Valide" ? "Actif" : "Expiré",
      requirements: "",
    }));
  }

  async createCertification(_certification: Omit<Certification, 'id' | 'issued'>): Promise<Certification> {
    throw new Error("La création manuelle de certifications n'est pas disponible. Les certificats sont générés automatiquement après validation des cours.");
  }

  async updateCertification(_id: number, _certification: Partial<Certification>): Promise<Certification> {
    throw new Error("La modification des certifications délivrées n'est pas disponible.");
  }

  async deleteCertification(_id: number): Promise<void> {
    throw new Error("La suppression des certifications délivrées n'est pas disponible.");
  }
}

export const certificationService = new CertificationService();
