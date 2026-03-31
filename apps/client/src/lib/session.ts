"use client";

import type { AuthSession } from "@inventra/types";
import { AUTH_COOKIE_NAME, AUTH_STORAGE_KEY } from "@inventra/utils";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function persistSession(session: AuthSession) {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=${session.accessToken}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearPersistedSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
