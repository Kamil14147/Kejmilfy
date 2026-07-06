import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "kejmilfy-dev-secret-change-me"
);

const COOKIE_NAME = "kejmilfy-session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      avatarColor: payload.avatarColor as string,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;

/**
 * Get session from request cookies (edge-compatible).
 * Use in API routes and middleware.
 */
export async function getSessionFromRequest(req: Request): Promise<SessionUser | null> {
  const cookie = req.headers.get("cookie") || "";
  const token = parseCookie(cookie, COOKIE_NAME);
  if (!token) return null;
  return await verifySessionToken(token);
}

function parseCookie(cookieStr: string, name: string): string | null {
  const cookies = cookieStr.split(";").map((c) => c.trim());
  for (const c of cookies) {
    const [k, v] = c.split("=");
    if (k === name) return decodeURIComponent(v || "");
  }
  return null;
}
