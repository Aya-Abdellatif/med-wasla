export const API_BASE = "http://localhost:5000";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

function getApiErrorMessage(data: Record<string, unknown>, status: number): string {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  switch (status) {
    case 400:
      return "Invalid request. Please check your information.";
    case 401:
      return "Invalid email or password.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This information is already in use.";
    case 503:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return status >= 500
        ? "Server error. Please try again later."
        : `Request failed (${status})`;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(getApiErrorMessage(data, res.status));
  }

  return data as T;
}
