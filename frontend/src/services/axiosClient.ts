import axios from "axios";
import { API_BASE, getToken } from "./api";

export const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getApiErrorMessage(data: Record<string, unknown>, status: number): string {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  switch (status) {
    case 400:
      return "Invalid request. Please check your information.";
    case 401:
      return "Please sign in to continue.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This information is already in use.";
    default:
      return status >= 500
        ? "Server error. Please try again later."
        : `Request failed (${status})`;
  }
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error("Cannot reach the server. Make sure the backend is running.");
      }

      const data = (error.response.data ?? {}) as Record<string, unknown>;
      throw new Error(getApiErrorMessage(data, error.response.status));
    }

    throw error;
  },
);
