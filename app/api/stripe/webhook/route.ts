import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";
import { withLogging } from "@/lib/with-logging";

export const runtime = "nodejs";

// Disable body parsing — we need the raw body for signature verification
export const dynamic = "force-dynamic";

async function postHandler(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          // Subscription created is handled separately; here we sync the customer ID
          // if it was not already set via the checkout route
          if (session.customer && session.metadata?.userId) {
            await db.user.update({
              where: { id: session.metadata.userId },
              data: { stripeCustomerId: session.customer as string },
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type — not an error
        break;
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

export const POST = withLogging(postHandler, 'POST /api/stripe/webhook')

async function getUserByCustomerId(customerId: string) {
  return db.user.findFirst({
    where: { stripeCustomerId: customerId },
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByCustomerId(customerId);

  if (!user) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }

  const status = subscription.status;
  const plan = status === "active" || status === "trialing" ? "pro" : "free";

  await db.user.update({
    where: { id: user.id },
    data: { plan },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByCustomerId(customerId);

  if (!user) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }

  const status = subscription.status;
  let plan: string;

  switch (status) {
    case "active":
    case "trialing":
      plan = "pro";
      break;
    case "past_due":
    case "unpaid":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
    default:
      plan = "free";
      break;
  }

  await db.user.update({
    where: { id: user.id },
    data: { plan },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByCustomerId(customerId);

  if (!user) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }

  await db.user.update({
    where: { id: user.id },
    data: { plan: "free" },
  });
}
