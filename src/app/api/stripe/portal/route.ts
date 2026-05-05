import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: member } = await supabase
    .from('organization_members')
    .select('organizations(stripe_customer_id)')
    .eq('user_id', user.id)
    .single()

  const org = member?.organizations as any
  if (!org?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await createPortalSession(org.stripe_customer_id, `${appUrl}/billing`)

  return NextResponse.json({ url: session.url })
}
