import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { withLogging } from "@/lib/with-logging";

async function postHandler(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!process.env.STRIPE_PRO_PRICE_ID) {
      return NextResponse.json(
        { error: "Stripe price ID not configured" },
        { status: 500 }
      );
    }

    const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;

      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/dashboard?upgrade=cancelled`,
      subscription_data: {
        metadata: { userId: user.id },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export const POST = withLogging(postHandler, "POST /api/stripe/checkout");
