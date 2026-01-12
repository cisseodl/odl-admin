import { STORAGE_KEYS } from "@/constants/auth";

import { FULL_API_URL } from "./api.config";

export class FileUploadService {
  /**
   * Upload un fichier vers S3
   * @param file Le fichier à uploader
   * @param folderName Le dossier dans S3 (ex: "lessons", "courses", "documents")
   * @returns L'URL du fichier uploadé
   */
  async uploadFile(file: File, folderName: string = "lessons"): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderName", folderName);

    // Essayer d'abord AUTH_TOKEN (utilisé par lib/auth.ts), puis TOKEN pour compatibilité
    const token = typeof window !== "undefined" ? 
      (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN)) : null;

    // Le backend retourne directement l'URL en String dans ResponseEntity.ok(url)
    const response = await fetch(`${FULL_API_URL}/api/files/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}: `;
      try {
        const errorText = await response.text();
        errorMessage += errorText || response.statusText;
      } catch (e) {
        errorMessage += response.statusText || "Erreur inconnue";
      }
      
      // Messages d'erreur plus explicites selon le code de statut
      if (response.status === 500) {
        errorMessage += ". Vérifiez la configuration AWS S3 (credentials, bucket, région) dans le backend.";
      } else if (response.status === 401 || response.status === 403) {
        errorMessage += ". Vérifiez votre authentification.";
      }
      
      throw new Error(errorMessage);
    }

    // Le backend retourne directement l'URL en String
    const url = await response.text();
    if (!url || url.trim() === "") {
      throw new Error("Le serveur a retourné une URL vide. Vérifiez la configuration AWS S3.");
    }
    return url.trim();
  }
}

export const fileUploadService = new FileUploadService();
