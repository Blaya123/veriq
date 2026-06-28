import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>("/auth/login", { email, password });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "An unexpected error occurred";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.post<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>("/auth/signup", { name, email, password });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "An unexpected error occurred";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false, error: null });
    window.location.href = "/login";
  },

  refreshToken: async () => {
    try {
      const data = await api.post<{
        accessToken: string;
        refreshToken?: string;
      }>("/auth/refresh");

      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));
