import Stripe from 'stripe'
import { Plan } from '@/types'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_placeholder')) {
    throw new Error('Stripe not configured')
  }
  return new Stripe(key, { apiVersion: '2025-02-24.acacia', typescript: true })
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

export const PRICE_IDS: Record<Plan, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  agency: process.env.STRIPE_AGENCY_PRICE_ID!,
}

export async function createOrRetrieveCustomer(
  organizationId: string,
  email: string,
  name: string
): Promise<string> {
  const existingCustomers = await stripe.customers.search({
    query: `metadata['organization_id']:'${organizationId}'`,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { organization_id: organizationId },
  })

  return customer.id
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  organizationId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: { organization_id: organizationId },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export function getPlanFromPriceId(priceId: string): Plan | null {
  for (const [plan, id] of Object.entries(PRICE_IDS)) {
    if (id === priceId) return plan as Plan
  }
  return null
}
