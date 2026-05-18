import apiClient from "./client";

type AuthResponse = {
  user: { id: string; email: string; displayName: string; avatarUrl: string | null; createdAt: string };
  token: string;
};

export async function register(email: string, password: string, displayName: string) {
  const res = await apiClient.post<{ success: boolean; data: AuthResponse }>("/auth/register", {
    email,
    password,
    displayName,
  });
  return res.data.data;
}

export async function login(email: string, password: string) {
  const res = await apiClient.post<{ success: boolean; data: AuthResponse }>("/auth/login", {
    email,
    password,
  });
  return res.data.data;
}

export async function getMe() {
  const res = await apiClient.get<{ success: boolean; data: { user: AuthResponse["user"] } }>("/auth/me");
  return res.data.data.user;
}
