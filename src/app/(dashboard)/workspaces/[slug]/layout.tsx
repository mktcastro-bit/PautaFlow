import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/sidebar'
import { DEMO_MODE, demoOrg, demoWorkspaces } from '@/lib/demo-data'

interface Props {
  children: React.ReactNode
  params: { slug: string }
}

export default async function WorkspaceLayout({ children, params }: Props) {
  if (DEMO_MODE) {
    const currentWorkspace = demoWorkspaces.find(ws => ws.slug === params.slug)
    if (!currentWorkspace) notFound()
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar
          organization={demoOrg}
          workspaces={demoWorkspaces}
          currentWorkspace={currentWorkspace}
        />
        <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(*)')
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/login')

  const organization = member.organizations as any

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('organization_id', organization.id)
    .order('created_at')

  const currentWorkspace = workspaces?.find(ws => ws.slug === params.slug)
  if (!currentWorkspace) notFound()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        organization={organization}
        workspaces={workspaces || []}
        currentWorkspace={currentWorkspace}
      />
      <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>
    </div>
  )
}
