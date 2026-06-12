import { NextResponse } from "next/server";
import Stripe from "stripe";

/* GET ?session_id → verifies a Stripe Checkout session actually paid.
   Demo payment ids (demo_*) are accepted as paid by definition. */

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id") ?? "";
  if (id.startsWith("demo_")) return NextResponse.json({ paid: true, reference: id });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "stripe_not_configured" }, { status: 400 });

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.retrieve(id).catch(() => null);
  if (!session) return NextResponse.json({ error: "unknown_session" }, { status: 404 });
  return NextResponse.json({ paid: session.payment_status === "paid", reference: id });
}
