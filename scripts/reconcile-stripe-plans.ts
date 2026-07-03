/**
 * Reconcile user `plan` against live Stripe reality.
 *
 * Background: the app was switched from Stripe test keys to live keys. Users
 * who "subscribed" while in test mode had their `plan` set to "pro" by the
 * test-mode webhook, but their `stripeCustomerId` (a test-mode id) no longer
 * resolves under the live key — so they have no live subscription. This script
 * downgrades those stale accounts back to "free".
 *
 * A user is downgraded only when their stored `stripeCustomerId` does NOT
 * resolve under the current Stripe key (missing or deleted). Users with a
 * valid live customer are left untouched — their plan is owned by the webhook.
 * If Stripe returns an unexpected error for a user, they are skipped (never
 * downgraded on a transient failure).
 *
 * Dry-run by default. Pass --apply to write changes.
 *
 * Run (dry-run):
 *   TS_NODE_PROJECT=tsconfig.scripts.json node --env-file=.env \
 *     -r ts-node/register scripts/reconcile-stripe-plans.ts
 * Run (apply):
 *   ... scripts/reconcile-stripe-plans.ts --apply
 */

import { db } from '../lib/db'
import { stripeCustomerExists } from '../lib/stripe'

type Outcome = 'downgrade' | 'keep' | 'skip'

async function main() {
  const apply = process.argv.includes('--apply')
  console.log(`Mode: ${apply ? 'APPLY (will write)' : 'DRY-RUN (no writes)'}\n`)

  const users = await db.user.findMany({
    where: { plan: { not: 'free' } },
    select: { id: true, email: true, plan: true, stripeCustomerId: true },
  })
  console.log(`Found ${users.length} user(s) with plan != "free".\n`)

  const toDowngrade: string[] = []

  for (const u of users) {
    let outcome: Outcome
    let reason: string

    if (!u.stripeCustomerId) {
      outcome = 'downgrade'
      reason = 'no stripeCustomerId'
    } else {
      try {
        const exists = await stripeCustomerExists(u.stripeCustomerId)
        if (exists) {
          outcome = 'keep'
          reason = 'live customer resolves'
        } else {
          outcome = 'downgrade'
          reason = 'customer missing in live mode'
        }
      } catch (err) {
        outcome = 'skip'
        reason = `stripe error: ${(err as Error).message}`
      }
    }

    if (outcome === 'downgrade') toDowngrade.push(u.id)
    const tag = outcome === 'downgrade' ? 'DOWNGRADE' : outcome === 'keep' ? 'keep     ' : 'SKIP     '
    console.log(`  [${tag}] ${u.email}  (plan=${u.plan}, cust=${u.stripeCustomerId ?? 'none'}) — ${reason}`)
  }

  console.log(`\nSummary: ${toDowngrade.length} to downgrade, ${users.length - toDowngrade.length} unchanged.`)

  if (apply && toDowngrade.length > 0) {
    const res = await db.user.updateMany({
      where: { id: { in: toDowngrade } },
      data: { plan: 'free' },
    })
    console.log(`\nApplied: set plan="free" for ${res.count} user(s).`)
  } else if (!apply && toDowngrade.length > 0) {
    console.log('\nDry-run only. Re-run with --apply to write these changes.')
  }

  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
