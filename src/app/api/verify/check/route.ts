import { NextResponse } from "next/server";
import { hashCode, signPayload, verifyPayload } from "@/lib/verify";

/* POST { token, code } → { ok, proof } — proof is a signed claim that
   `to` was verified, attachable to the application. */

export async function POST(req: Request) {
  const { token, code } = await req.json().catch(() => ({}) as Record<string, string>);
  const payload = token ? await verifyPayload(token) : null;
  if (!payload?.to || !payload.h) {
    return NextResponse.json({ error: "expired" }, { status: 400 });
  }
  if (hashCode(String(code ?? "").trim(), String(payload.to)) !== payload.h) {
    return NextResponse.json({ error: "wrong_code" }, { status: 400 });
  }
  const proof = await signPayload(
    { to: payload.to, channel: payload.channel, verified: true },
    "24h",
  );
  return NextResponse.json({ ok: true, proof, to: payload.to });
}
