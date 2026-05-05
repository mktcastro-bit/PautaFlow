import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BillingClient } from '@/components/shared/billing-client'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('organization_members')
    .select('role, organizations(*)')
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/login')

  return (
    <BillingClient
      organization={member.organizations as any}
      userRole={member.role as any}
    />
  )
}
