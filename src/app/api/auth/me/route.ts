import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json({ username: session.sub, role: session.role });
}
