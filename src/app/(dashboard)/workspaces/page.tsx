import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = await createAdminClient()

  // 1. Buscar membership existente (via admin, sem RLS)
  let { data: member } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // 2. Se não tem membership, criar org + member
  if (!member) {
    const baseName = user.email?.split('@')[0] || 'minha-marca'
    const slug = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + user.id.slice(0, 8)

    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .insert({ name: baseName, slug })
      .select('id')
      .single()

    if (orgErr || !org) {
      throw new Error('Falha ao criar organização: ' + (orgErr?.message || 'desconhecido'))
    }

    const { error: memberErr } = await admin
      .from('organization_members')
      .insert({ organization_id: org.id, user_id: user.id, role: 'owner' })

    if (memberErr) {
      throw new Error('Falha ao criar membership: ' + memberErr.message)
    }

    member = { organization_id: org.id }
  }

  // 3. Buscar workspaces existentes
  let { data: workspaces } = await admin
    .from('workspaces')
    .select('slug')
    .eq('organization_id', member.organization_id)
    .order('created_at')

  // 4. Se não tem workspace, criar o "Principal"
  if (!workspaces || workspaces.length === 0) {
    const { data: ws, error: wsErr } = await admin
      .from('workspaces')
      .insert({
        organization_id: member.organization_id,
        name: 'Principal',
        slug: 'principal',
        created_by: user.id,
      })
      .select('slug')
      .single()

    if (wsErr || !ws) {
      throw new Error('Falha ao criar workspace: ' + (wsErr?.message || 'desconhecido'))
    }

    workspaces = [ws]
  }

  // 5. Redireciona para o primeiro workspace
  redirect(`/workspaces/${workspaces[0].slug}/pautas`)
}
