export interface FulfillmentCheckoutSession {
  payment_status?: string | null;
  customer?: string | { id: string } | null;
  metadata?: { userId?: string } | null;
}

export interface FulfillmentUser {
  id: string;
  stripeCustomerId: string | null;
}

/**
 * Decides whether a completed Stripe Checkout session should grant the user Pro.
 * Pure: no I/O. The session must be paid AND owned by the user — ownership is
 * matched by Stripe customer id (primary) or checkout metadata.userId (secondary).
 */
export function isPaidAndOwned(
  session: FulfillmentCheckoutSession,
  user: FulfillmentUser
): boolean {
  if (session.payment_status !== "paid") {
    return false;
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : null;
  const ownsByCustomer =
    !!user.stripeCustomerId && customerId === user.stripeCustomerId;
  const ownsByMetadata =
    !!session.metadata?.userId && session.metadata.userId === user.id;

  return ownsByCustomer || ownsByMetadata;
}
