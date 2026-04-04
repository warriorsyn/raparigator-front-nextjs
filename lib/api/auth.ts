import { apiRequest } from "@/lib/api/client";
import type {
  AuthResponse,
  LoginRequest,
  MyProfileResponse,
  RegisterClientRequest,
  RegisterProfessionalRequest,
} from "@/lib/api/types";

export function login(payload: LoginRequest) {
  return apiRequest<AuthResponse>("/api/Auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerClient(payload: RegisterClientRequest) {
  return apiRequest<AuthResponse>("/api/Auth/register/client", {
    method: "POST",
    body: payload,
  });
}

export function registerProfessional(payload: RegisterProfessionalRequest) {
  return apiRequest<AuthResponse>("/api/Auth/register/professional", {
    method: "POST",
    body: payload,
  });
}

export function getMyProfile(token: string) {
  return apiRequest<MyProfileResponse>("/api/Profiles/me", { token });
}
