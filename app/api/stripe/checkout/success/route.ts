import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { isPaidAndOwned } from "@/lib/stripe-fulfillment";
import { withLogging } from "@/lib/with-logging";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequest) {
  const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    return NextResponse.redirect(`${appUrl}/sign-in`);
  }

  const successUrl = `${appUrl}/dashboard?upgrade=success`;
  const sessionId = req.nextUrl.searchParams.get("session_id");

  // Best-effort reconcile: never let a failure here make the UX worse than the
  // webhook-driven path. Any problem just falls through to the success redirect.
  if (sessionId) {
    try {
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (user) {
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
        if (isPaidAndOwned(checkoutSession, user)) {
          await db.user.update({
            where: { id: user.id },
            data: { plan: "pro" },
          });
        }
      }
    } catch (error) {
      console.error("Checkout success reconcile failed:", error);
    }
  }

  return NextResponse.redirect(successUrl);
}

export const GET = withLogging(getHandler, "GET /api/stripe/checkout/success");
