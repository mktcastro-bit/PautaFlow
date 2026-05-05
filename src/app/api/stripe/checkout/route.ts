import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrRetrieveCustomer, createCheckoutSession, PRICE_IDS } from '@/lib/stripe'
import { Plan } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: Plan }

  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(id, name, stripe_customer_id)')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const org = member.organizations as any
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const customerId = await createOrRetrieveCustomer(
    org.id,
    user.email!,
    org.name
  )

  if (!org.stripe_customer_id) {
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', org.id)
  }

  const session = await createCheckoutSession(
    customerId,
    PRICE_IDS[plan],
    org.id,
    `${appUrl}/billing?success=true`,
    `${appUrl}/billing?canceled=true`
  )

  return NextResponse.json({ url: session.url })
}
