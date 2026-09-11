import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, try exactly one silent refresh before giving up and logging out —
// prevents infinite refresh loops if the refresh token itself is invalid.
let isRefreshing = false;

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;
      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh, user } = res.data.data;
        useAuthStore.getState().setSession(user, accessToken, newRefresh);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
