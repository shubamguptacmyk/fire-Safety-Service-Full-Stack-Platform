import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAdminAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthEndpoint = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !original?._retry && !isRefreshing && !isAuthEndpoint) {
      if (original) original._retry = true;
      isRefreshing = true;
      try {
        const { refreshToken } = useAdminAuthStore.getState();
        if (!refreshToken) throw new Error("No refresh token");
        const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh, user } = res.data.data;
        useAdminAuthStore.getState().setSession(user, accessToken, newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch (refreshErr) {
        useAdminAuthStore.getState().clearSession();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
