"use client";

import * as React from "react";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

interface SessionState {
  user: SessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

let cachedSession: SessionState | null = null;
const listeners = new Set<(s: SessionState) => void>();

async function fetchSession(): Promise<SessionState> {
  try {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return { user: null, status: "unauthenticated" };
    const data = await res.json();
    return data.user
      ? { user: data.user, status: "authenticated" }
      : { user: null, status: "unauthenticated" };
  } catch {
    return { user: null, status: "unauthenticated" };
  }
}

export function useSession(): SessionState {
  const [state, setState] = React.useState<SessionState>(
    cachedSession || { user: null, status: "loading" }
  );

  React.useEffect(() => {
    if (cachedSession) {
      setState(cachedSession);
      return;
    }
    let mounted = true;
    fetchSession().then((s) => {
      if (!mounted) return;
      cachedSession = s;
      setState(s);
      listeners.forEach((l) => l(s));
    });
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

export async function refreshSession() {
  cachedSession = null;
  const s = await fetchSession();
  cachedSession = s;
  listeners.forEach((l) => l(s));
  return s;
}

export async function login(email: string, password: string): Promise<boolean> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return false;
  await refreshSession();
  return true;
}

export async function register(name: string, email: string, password: string): Promise<boolean> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) return false;
  await refreshSession();
  return true;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  cachedSession = { user: null, status: "unauthenticated" };
  listeners.forEach((l) => l(cachedSession!));
}
