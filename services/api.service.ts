// services/api.service.ts
import { STORAGE_KEYS } from "@/constants/auth";

const API_BASE_URL = "http://odc-learning-backend-env.eba-ruizssvt.us-east-1.elasticbeanstalk.com/"; // Base URL for the API

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const token = options?.token || (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null);
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
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (networkError: any) {
    // Catch actual network errors (e.g., DNS resolution, connection refused)
    const errorMessage = networkError.message || "Failed to connect to the API server.";
    console.error(`Network error connecting to ${API_BASE_URL}${endpoint}:`, errorMessage);
    console.error("Vérifiez que le backend est démarré sur http://localhost:8080");
    throw new Error(`Erreur réseau: ${errorMessage}. Vérifiez que le backend est démarré sur http://localhost:8080`);
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

  // Vérifier si la réponse contient une erreur (CResponse avec ok: false)
  if (jsonData && jsonData.ok === false) {
    throw new Error(jsonData.message || `API Error ${response.status}: Something went wrong`);
  }

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${jsonData?.message || response.statusText || "Something went wrong"}`);
  }

  return jsonData;
}
