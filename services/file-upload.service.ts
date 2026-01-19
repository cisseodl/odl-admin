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
      
      // Validation de la taille du fichier (1000MB = 1GB = 1000 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1000MB (1GB)
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(2)}MB). La taille maximale autorisée est de 1000MB (1GB). Veuillez réduire la taille du fichier ou le compresser.`);
      }
      
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

      // Le backend retourne maintenant CResponse<String> au format JSON
      const contentType = response.headers.get('content-type');
      let jsonData: any;
      
      if (contentType && contentType.includes('application/json')) {
        jsonData = await response.json();
      } else {
        // Fallback pour les anciennes réponses en texte
        const textResponse = await response.text();
        if (!response.ok) {
          throw new Error(textResponse || `Erreur ${response.status}: ${response.statusText}`);
        }
        return textResponse.trim();
      }

      // Vérifier si la réponse contient une erreur (CResponse avec ok: false)
      if (jsonData && jsonData.ok === false) {
        const errorMessage = jsonData.message || `Erreur ${response.status}: Upload échoué`;
        console.error(`[FileUploadService] Erreur CResponse: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: `;
        errorMessage += jsonData?.message || jsonData?.error || response.statusText;
        
        // Messages d'erreur plus explicites selon le code de statut
        if (response.status === 413) {
          errorMessage = `Le fichier est trop volumineux (limite: 1000MB / 1GB). Veuillez réduire la taille du fichier ou le compresser.`;
        } else if (response.status === 500) {
          errorMessage += ". Vérifiez la configuration du serveur.";
        } else if (response.status === 401 || response.status === 403) {
          errorMessage += ". Vérifiez votre authentification.";
        }
        
        throw new Error(errorMessage);
      }

      // Extraire l'URL depuis CResponse.data
      const url = jsonData?.data || jsonData;
      console.log(`[FileUploadService] Réponse JSON complète:`, jsonData);
      console.log(`[FileUploadService] URL extraite: ${url}`);
      
      if (!url || (typeof url === 'string' && url.trim() === "")) {
        throw new Error("Le serveur a retourné une URL vide. Vérifiez la configuration du serveur.");
      }
      
      const finalUrl = typeof url === 'string' ? url.trim() : String(url);
      console.log(`[FileUploadService] Upload réussi, URL finale: ${finalUrl}`);
      return finalUrl;
    } catch (error: any) {
      console.error(`[FileUploadService] Erreur dans uploadFile:`, error);
      console.error(`[FileUploadService] Message:`, error.message);
      console.error(`[FileUploadService] Stack:`, error.stack);
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
