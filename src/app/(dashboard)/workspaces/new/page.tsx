import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewWorkspaceClient } from '@/components/workspaces/new-workspace-client'

export default async function NewWorkspacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <NewWorkspaceClient />
}
