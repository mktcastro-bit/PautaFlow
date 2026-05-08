import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/settings/settings-client'

interface Props {
  params: { slug: string }
}

export default async function SettingsPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = await createAdminClient()

  const { data: workspace } = await admin
    .from('workspaces').select('*').eq('slug', params.slug).single()
  if (!workspace) notFound()

  const { data: organization } = await admin
    .from('organizations').select('*').eq('id', workspace.organization_id).single()

  return <SettingsClient workspace={workspace} organization={organization} />
}
