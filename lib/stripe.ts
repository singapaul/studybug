import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

/**
 * Whether a stored Stripe customer id still resolves under the *current* API
 * key. A customer created in test mode does not exist once the app is switched
 * to live keys (and vice versa), and deleted customers must also be treated as
 * gone. In those cases Stripe throws `resource_missing`; we translate that to
 * `false` so callers can recreate the customer or surface a clear message
 * rather than leaking a generic 500. Any other error (network, auth) rethrows.
 */
export async function stripeCustomerExists(customerId: string): Promise<boolean> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return !("deleted" in customer && customer.deleted);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing"
    ) {
      return false;
    }
    throw error;
  }
}
