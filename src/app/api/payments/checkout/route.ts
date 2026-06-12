import { NextResponse } from "next/server";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { getVisa } from "@/lib/mock/data";

/* POST { visaType, origin } → Stripe Checkout when STRIPE_SECRET_KEY is set,
   otherwise a demo payment intent the client renders as an inline sheet.
   The fee is always resolved server-side from the visa catalogue. */

export async function POST(req: Request) {
  const { visaType, origin } = await req.json().catch(() => ({}) as Record<string, string>);
  const visa = getVisa(String(visaType ?? ""));
  if (!visa) return NextResponse.json({ error: "bad_visa_type" }, { status: 400 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({
      demo: true,
      paymentId: `demo_${randomUUID().slice(0, 8)}`,
      amountUsd: visa.feeUsd,
    });
  }

  const stripe = new Stripe(key);
  const base = String(origin ?? "").replace(/\/$/, "");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: visa.feeUsd * 100,
          product_data: { name: `Visa application fee — ${visa.name.en}` },
        },
      },
    ],
    success_url: `${base}/apply?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/apply?paid=0`,
  });

  return NextResponse.json({ demo: false, url: session.url, amountUsd: visa.feeUsd });
}
