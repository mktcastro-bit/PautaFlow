import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Layers } from 'lucide-react'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let { data: member } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  // Trigger não criou a org — cria agora via service role
  if (!member) {
    const admin = await createAdminClient()
    const orgName = user.email?.split('@')[0] || 'minha-marca'
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + user.id.slice(0, 8)

    const { data: org } = await admin
      .from('organizations')
      .insert({ name: orgName, slug: orgSlug })
      .select()
      .single()

    if (org) {
      await admin.from('organization_members').insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      })
      await admin.from('workspaces').insert({
        organization_id: org.id,
        name: 'Principal',
        slug: 'principal',
        created_by: user.id,
      })
      member = { organization_id: org.id }
    }
  }

  if (!member) redirect('/login')

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('organization_id', member.organization_id)
    .order('created_at')

  if (workspaces && workspaces.length > 0) {
    redirect(`/workspaces/${workspaces[0].slug}/pautas`)
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4 max-w-md">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <Layers className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Nenhum workspace encontrado</h2>
        <p className="text-muted-foreground text-sm">
          Crie seu primeiro workspace para começar a organizar suas pautas.
        </p>
        <Link
          href="/workspaces/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Criar workspace
        </Link>
      </div>
    </div>
  )
}
