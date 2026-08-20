import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

const cookieName = "venoria_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "development-only-secret-change-me");

export type AuthUser = { id: string; organizationId: string; email: string; name: string; role: string };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: AuthUser) {
  return new SignJWT({ organizationId: user.organizationId, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function readSession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.organizationId !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string" || typeof payload.role !== "string") return null;
    return { id: payload.sub, organizationId: payload.organizationId, email: payload.email, name: payload.name, role: payload.role } satisfies AuthUser;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  return `${cookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearSessionCookie() {
  return `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function getSessionCookie(cookieHeader: string | undefined) {
  return cookieHeader?.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
}
