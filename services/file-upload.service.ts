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
    try {
      console.log(`[FileUploadService] uploadFile appelé - fichier: ${file.name}, taille: ${file.size}, type: ${file.type}, dossier: ${folderName}`);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderName", folderName);

      // Essayer d'abord AUTH_TOKEN (utilisé par lib/auth.ts), puis TOKEN pour compatibilité
      const token = typeof window !== "undefined" ? 
        (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN)) : null;

      console.log(`[FileUploadService] Token présent: ${!!token}`);
      console.log(`[FileUploadService] URL complète: ${FULL_API_URL}/api/files/upload`);

      // Le backend retourne directement l'URL en String dans ResponseEntity.ok(url)
      const response = await fetch(`${FULL_API_URL}/api/files/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      console.log(`[FileUploadService] Réponse reçue - Status: ${response.status}, OK: ${response.ok}`);

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: `;
        try {
          const errorText = await response.text();
          console.error(`[FileUploadService] Texte d'erreur: ${errorText}`);
          errorMessage += errorText || response.statusText;
        } catch (e) {
          console.error(`[FileUploadService] Erreur lors de la lecture du texte d'erreur:`, e);
          errorMessage += response.statusText || "Erreur inconnue";
        }
        
        // Messages d'erreur plus explicites selon le code de statut
        if (response.status === 500) {
          errorMessage += ". Vérifiez la configuration du serveur.";
        } else if (response.status === 401 || response.status === 403) {
          errorMessage += ". Vérifiez votre authentification.";
        }
        
        throw new Error(errorMessage);
      }

      // Le backend retourne directement l'URL en String
      const url = await response.text();
      console.log(`[FileUploadService] URL reçue: ${url}`);
      
      if (!url || url.trim() === "") {
        throw new Error("Le serveur a retourné une URL vide. Vérifiez la configuration du serveur.");
      }
      
      console.log(`[FileUploadService] Upload réussi, URL finale: ${url.trim()}`);
      return url.trim();
    } catch (error: any) {
      console.error(`[FileUploadService] Erreur dans uploadFile:`, error);
      console.error(`[FileUploadService] Message:`, error.message);
      console.error(`[FileUploadService] Stack:`, error.stack);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
