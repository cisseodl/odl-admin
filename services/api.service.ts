// services/api.service.ts
import { STORAGE_KEYS } from "@/constants/auth";
import { FULL_API_URL } from "./api.config"; // Utiliser la configuration centralisée

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  // Essayer d'abord AUTH_TOKEN (utilisé par lib/auth.ts), puis TOKEN pour compatibilité
  const token = options?.token || (typeof window !== "undefined" ? 
    (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN)) : null);
  
  // Debug: Log pour vérifier si le token est présent
  if (typeof window !== "undefined" && !token) {
    console.warn(`[API] No token found for request to ${endpoint}. Available keys:`, {
      AUTH_TOKEN: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ? "present" : "missing",
      TOKEN: localStorage.getItem(STORAGE_KEYS.TOKEN) ? "present" : "missing"
    });
  }
  
  const headers: Record<string, string> = {
    ...options?.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Ne définir Content-Type que s'il y a un body et que ce n'est pas FormData
  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options?.body instanceof FormData) {
    // If body is FormData, fetch API will set the Content-Type header automatically
    // Ne pas définir Content-Type pour FormData
  } else if (options?.body && typeof options.body !== 'string') {
    // Stringify non-FormData, non-string bodies
    config.body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`${FULL_API_URL}${endpoint}`, config); // Utiliser FULL_API_URL
  } catch (networkError: any) {
    // Catch actual network errors (e.g., DNS resolution, connection refused)
    const errorMessage = networkError.message || "Failed to connect to the API server.";
    console.error(`Network error connecting to ${FULL_API_URL}${endpoint}:`, errorMessage);
    throw new Error(`Erreur réseau: ${errorMessage}. Vérifiez que le serveur backend est accessible.`);
  }

  const contentType = response.headers.get('content-type');
  let jsonData: any;
  
  if (contentType && contentType.includes('application/json')) {
    jsonData = await response.json();
  } else {
    // Handle non-JSON responses, e.g., plain text success messages
    // For DELETE operations, an empty response body is also common.
    const textResponse = await response.text();
    // Return based on whether text content is available, otherwise null/undefined
    return (textResponse ? { message: textResponse } : null) as T;
  }

  // Traiter CResponse avec ok: false comme erreur (même en 200) pour afficher le message côté UI
  if (jsonData && jsonData.ok === false) {
    throw new Error(jsonData.message || `Erreur API: ${response.status}`);
  }

  if (!response.ok) {
    // Gestion spéciale pour les erreurs 401/403 - token invalide ou expiré
    if (response.status === 401 || response.status === 403) {
      // Si le token est invalide ou expiré, nettoyer le localStorage et rediriger
      if (typeof window !== "undefined") {
        console.warn(`[API] Authentication error (${response.status}) for ${endpoint}. Clearing auth data.`);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        
        // Rediriger vers la page de connexion si on n'y est pas déjà
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      throw new Error(`Erreur d'authentification (${response.status}): Votre session a expiré. Veuillez vous reconnecter.`);
    }
    throw new Error(`API Error ${response.status}: ${jsonData?.message || response.statusText || "Something went wrong"}`);
  }

  return jsonData;
}
