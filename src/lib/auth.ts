import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/* Officer sessions: HS256 JWT in an httpOnly cookie. Set AUTH_SECRET in
   production; the fallback keeps the demo running but is public knowledge. */

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "vv-demo-secret-do-not-use-in-production",
);

export const SESSION_COOKIE = "vv_session";

export async function createSession(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "officer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifySession(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
