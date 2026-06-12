import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { resolveMx } from "dns/promises";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { hashCode, signPayload } from "@/lib/verify";

/* POST { channel: "email"|"phone", to }
   Validates the address server-side, generates a code, sends it via
   Resend (email) / Twilio (SMS) when keys are configured — otherwise
   returns the code in the response, clearly flagged as demo mode. */

export async function POST(req: Request) {
  const { channel, to } = await req.json().catch(() => ({}) as Record<string, string>);
  if (channel !== "email" && channel !== "phone") {
    return NextResponse.json({ error: "bad_channel" }, { status: 400 });
  }

  let normalized: string;
  if (channel === "email") {
    const email = String(to ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 422 });
    }
    const domain = email.split("@")[1];
    try {
      const mx = await resolveMx(domain);
      if (!mx.length) return NextResponse.json({ error: "invalid_email" }, { status: 422 });
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === "ENOTFOUND" || code === "ENODATA") {
        return NextResponse.json({ error: "invalid_email" }, { status: 422 });
      }
      // transient DNS failure: don't block the applicant on our infra
    }
    normalized = email;
  } else {
    const parsed = parsePhoneNumberFromString(String(to ?? ""), "US");
    if (!parsed?.isValid()) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 422 });
    }
    normalized = parsed.number; // E.164
  }

  const code = String(randomInt(100000, 1000000));
  const sent = await send(channel, normalized, code);
  const token = await signPayload({ to: normalized, channel, h: hashCode(code, normalized) }, "10m");

  return NextResponse.json({
    token,
    to: normalized,
    demo: !sent,
    ...(sent ? {} : { demoCode: code }),
  });
}

async function send(channel: "email" | "phone", to: string, code: string): Promise<boolean> {
  if (channel === "email" && process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.VERIFY_EMAIL_FROM ?? "VisaVenezuela <onboarding@resend.dev>",
        to: [to],
        subject: `${code} — código de verificación / verification code`,
        text: `Tu código de verificación es ${code}. Vence en 10 minutos.\n\nYour verification code is ${code}. It expires in 10 minutes.`,
      }),
    });
    return res.ok;
  }
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: tok, TWILIO_FROM: from } = process.env;
  if (channel === "phone" && sid && tok && from) {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${tok}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: `VisaVenezuela: ${code}` }),
    });
    return res.ok;
  }
  return false; // demo mode
}
