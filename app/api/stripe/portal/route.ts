import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, stripeCustomerExists } from "@/lib/stripe";
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

    // A stored id created under a different Stripe mode (e.g. test-mode ids
    // left over after switching to live keys) no longer resolves, which means
    // there is no live subscription to manage. Treat it the same as no account.
    if (!user.stripeCustomerId || !(await stripeCustomerExists(user.stripeCustomerId))) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe first." },
        { status: 400 }
      );
    }

    const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/settings?tab=billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}

export const POST = withLogging(postHandler, "POST /api/stripe/portal");
