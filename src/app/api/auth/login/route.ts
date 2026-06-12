import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

/* Credentials come from env (OFFICER_USERNAME + bcrypt OFFICER_PASSWORD_HASH).
   Without them the documented demo account works: oficial / caracas2026. */

const DEMO_USER = "oficial";
const DEMO_PASS = "caracas2026";

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}) as Record<string, string>);
  if (!username || !password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  }

  const envUser = process.env.OFFICER_USERNAME;
  const envHash = process.env.OFFICER_PASSWORD_HASH;

  const ok =
    envUser && envHash
      ? username === envUser && (await bcrypt.compare(password, envHash))
      : username === DEMO_USER && password === DEMO_PASS;

  if (!ok) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  const token = await createSession(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 3600,
    path: "/",
  });
  return res;
}
