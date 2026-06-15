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

export async function forgotPassword(email: string) {
  const res = await apiClient.post<{ success: boolean; data: { message: string } }>("/auth/forgot-password", { email });
  return res.data.data;
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await apiClient.post<{ success: boolean; data: { message: string } }>("/auth/reset-password", { token, newPassword });
  return res.data.data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await apiClient.post<{ success: boolean; data: { message: string } }>("/auth/change-password", { oldPassword, newPassword });
  return res.data.data;
}

export async function requestEmailChange(newEmail: string, password: string) {
  const res = await apiClient.post<{ success: boolean; data: { message: string } }>("/auth/change-email", { newEmail, password });
  return res.data.data;
}

export async function confirmEmailChange(token: string) {
  const res = await apiClient.post<{ success: boolean; data: { message: string; email: string } }>("/auth/confirm-email-change", { token });
  return res.data.data;
}
