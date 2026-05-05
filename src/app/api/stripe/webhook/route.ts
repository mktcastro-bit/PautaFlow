import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanFromPriceId } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  async function updateOrg(organizationId: string, updates: Record<string, unknown>) {
    await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.organization_id
      if (!orgId) break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = subscription.items.data[0]?.price.id
      const plan = getPlanFromPriceId(priceId) || 'starter'

      await updateOrg(orgId, {
        plan,
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const orgId = subscription.metadata?.organization_id
      if (!orgId) break

      const priceId = subscription.items.data[0]?.price.id
      const plan = getPlanFromPriceId(priceId) || 'starter'

      await updateOrg(orgId, {
        plan,
        stripe_subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const orgId = subscription.metadata?.organization_id
      if (!orgId) break

      await updateOrg(orgId, {
        plan: 'starter',
        stripe_subscription_status: 'canceled',
        stripe_subscription_id: null,
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
