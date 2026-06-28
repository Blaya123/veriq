import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "veriq-secret-key";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "15m";
const JWT_REFRESH_EXPIRATION_DAYS = 7;

export interface JwtPayload {
  sub: string;
  email: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + JWT_REFRESH_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`FATAL: Required environment variable "${key}" is not set.`);
  return value;
}

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function authenticateRequest(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error("Unauthorized");
  const payload = verifyAccessToken(token);
  return payload;
}
