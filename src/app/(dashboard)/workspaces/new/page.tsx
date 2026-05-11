import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NewWorkspaceClient } from '@/components/workspaces/new-workspace-client'
import { LIMITS, type Plan } from '@/lib/usage-limits'
import { LimitReached } from '@/components/workspaces/limit-reached'

export default async function NewWorkspacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = await createAdminClient()

  // Pega org do usuário
  const { data: member } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/workspaces')

  const { data: org } = await admin
    .from('organizations')
    .select('plan, name')
    .eq('id', member.organization_id)
    .single()

  const plan: Plan = (org?.plan as Plan) || 'trial'
  const max = LIMITS[plan].workspaces

  const { count } = await admin
    .from('workspaces')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', member.organization_id)

  const current = count || 0

  // Se já no limite, mostra tela de upgrade em vez do formulário
  if (current >= max) {
    return (
      <LimitReached
        plan={plan}
        current={current}
        max={max}
        userEmail={user.email || ''}
      />
    )
  }

  return <NewWorkspaceClient />
}
