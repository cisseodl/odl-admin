// services/api.service.ts
import { STORAGE_KEYS } from "@/constants/auth";

const API_BASE_URL = "http://localhost:8080/awsodclearning"; // Base URL for the API

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const token = options?.token || (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null);
  const headers = {
    ...options?.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options?.body instanceof FormData) {
    // If body is FormData, fetch API will set the Content-Type header automatically
    // Removing it from custom headers to prevent "multipart/form-data;charset=UTF-8"
    delete headers["Content-Type"];
  } else if (options?.body && typeof options.body !== 'string') {
    // Stringify non-FormData, non-string bodies
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "Something went wrong");
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    // Handle non-JSON responses, e.g., plain text success messages
    // For DELETE operations, an empty response body is also common.
    const textResponse = await response.text();
    // Return based on whether text content is available, otherwise null/undefined
    return textResponse ? { message: textResponse } : null;
  }}
