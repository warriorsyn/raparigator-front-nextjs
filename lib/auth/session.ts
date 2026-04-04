import type { AuthResponse } from "@/lib/api/types";

export const SESSION_STORAGE_KEY = "sigillus_auth_session";
export const SESSION_COOKIE_KEY = "sigillus_session";
export const ROLES_COOKIE_KEY = "sigillus_roles";

export interface AuthSession extends AuthResponse {
  storedAtUtc: string;
}

function getSafeExpiryDate(expiresAtUtc?: string) {
  if (expiresAtUtc) {
    const date = new Date(expiresAtUtc);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

export function parseRolesCookie(value?: string | null) {
  if (!value) return [];

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  return decoded
    .split("|")
    .map((role) => role.trim())
    .filter(Boolean);
}

export function hasProfessionalRole(roles: string[]) {
  return roles.some((role) => role.toLowerCase().includes("professional"));
}

export function persistAuthSession(auth: AuthResponse) {
  if (typeof window === "undefined") return;

  const session: AuthSession = {
    ...auth,
    storedAtUtc: new Date().toISOString(),
  };

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  const expires = getSafeExpiryDate(auth.expiresAtUtc).toUTCString();
  const roles = encodeURIComponent(auth.roles.join("|"));

  document.cookie = `${SESSION_COOKIE_KEY}=1; path=/; expires=${expires}; samesite=lax`;
  document.cookie = `${ROLES_COOKIE_KEY}=${roles}; path=/; expires=${expires}; samesite=lax`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  document.cookie = `${ROLES_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

export function getAuthSession() {
  if (typeof window === "undefined") return null;

  const serialized = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized) as AuthSession;
    return parsed;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return getAuthSession()?.accessToken ?? null;
}

export function getSessionRoles() {
  const sessionRoles = getAuthSession()?.roles;
  if (sessionRoles?.length) return sessionRoles;

  if (typeof document === "undefined") return [];
  const rolesCookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${ROLES_COOKIE_KEY}=`))
    ?.split("=")[1];

  return parseRolesCookie(rolesCookie);
}
