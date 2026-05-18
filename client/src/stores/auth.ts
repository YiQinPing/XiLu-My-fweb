import { create } from "zustand";
import * as authApi from "@/api/auth";

type User = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("xilu-token"),
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("xilu-token", data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  register: async (email, password, displayName) => {
    const data = await authApi.register(email, password, displayName);
    localStorage.setItem("xilu-token", data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("xilu-token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("xilu-token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
