import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "quantum-secret-key-123";

export type AuthContext = {
  userId: string;
  email?: string;
};

export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export function requireAuth(req: NextRequest): AuthContext {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error("UNAUTHORIZED: Missing Bearer token.");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as any;
  if (!decoded?.userId) {
    throw new Error("UNAUTHORIZED: Invalid token.");
  }

  return { userId: decoded.userId, email: decoded.email };
}

