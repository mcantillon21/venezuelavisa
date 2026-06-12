import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { createHash } from "crypto";

/* Stateless OTP: the 6-digit code is never stored server-side. /verify/start
   returns a short-lived JWT carrying a salted hash of the code; /verify/check
   compares and issues a signed proof. Works on serverless with zero storage. */

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "vv-demo-secret-do-not-use-in-production",
);

export function hashCode(code: string, to: string): string {
  return createHash("sha256")
    .update(`${code}:${to}:${process.env.AUTH_SECRET ?? "vv-demo"}`)
    .digest("hex");
}

export async function signPayload(payload: JWTPayload, exp: string): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifyPayload(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
