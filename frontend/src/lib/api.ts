import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface BackendUser {
  user_id: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
}

/**
 * Lightweight API client that automatically attaches the current Clerk
 * session token as a Bearer token when calling the backend.
 *
 * Usage example:
 *   const api = useApiClient();
 *   const me = await api.get<BackendUser>("/auth/me");
 */
export function useApiClient() {
  const { getToken } = useAuth();

  async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();

    const headers = new Headers(init.headers ?? {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      const error: any = new Error(
        `API error ${response.status}: ${text || response.statusText}`,
      );
      error.status = response.status;
      error.retryAfter = response.headers.get("Retry-After");
      throw error;
    }

    // If there's no content, just return undefined as T
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  return {
    request,
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      }),
    delete: <T>(path: string) =>
      request<T>(path, {
        method: "DELETE",
      }),
  };
}

