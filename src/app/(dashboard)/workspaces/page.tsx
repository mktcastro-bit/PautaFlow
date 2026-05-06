import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

function ErrorDisplay({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-red-400">{title}</h1>
        <pre className="text-xs bg-black/50 rounded-lg p-3 overflow-auto max-h-96 text-zinc-300 whitespace-pre-wrap break-all">
          {detail}
        </pre>
        <a
          href="/api/auth/signout"
          className="inline-block bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Sair da conta
        </a>
      </div>
    </div>
  )
}

export default async function WorkspacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let admin
  try {
    admin = await createAdminClient()
  } catch (e: any) {
    return <ErrorDisplay title="Erro ao criar admin client" detail={String(e?.message || e)} />
  }

  // 1. Buscar membership existente
  const { data: member, error: memberErr } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (memberErr) {
    return <ErrorDisplay title="Erro lendo organization_members" detail={JSON.stringify(memberErr, null, 2)} />
  }

  let organizationId = member?.organization_id

  // 2. Se não tem membership, criar org + member
  if (!organizationId) {
    const baseName = user.email?.split('@')[0] || 'minha-marca'
    const slug = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + user.id.slice(0, 8)

    const { data: org, error: orgErr } = await admin
      .from('organizations')
      .insert({ name: baseName, slug })
      .select('id')
      .single()

    if (orgErr || !org) {
      return <ErrorDisplay title="Erro criando organization" detail={JSON.stringify(orgErr, null, 2)} />
    }

    const { error: insertMemberErr } = await admin
      .from('organization_members')
      .insert({ organization_id: org.id, user_id: user.id, role: 'owner' })

    if (insertMemberErr) {
      return <ErrorDisplay title="Erro criando membership" detail={JSON.stringify(insertMemberErr, null, 2)} />
    }

    organizationId = org.id
  }

  // 3. Buscar workspaces existentes
  const { data: workspaces, error: wsErr } = await admin
    .from('workspaces')
    .select('slug')
    .eq('organization_id', organizationId)
    .order('created_at')

  if (wsErr) {
    return <ErrorDisplay title="Erro lendo workspaces" detail={JSON.stringify(wsErr, null, 2)} />
  }

  // 4. Se não tem workspace, criar o "Principal"
  let firstSlug = workspaces?.[0]?.slug
  if (!firstSlug) {
    const { data: ws, error: createWsErr } = await admin
      .from('workspaces')
      .insert({
        organization_id: organizationId,
        name: 'Principal',
        slug: 'principal',
        created_by: user.id,
      })
      .select('slug')
      .single()

    if (createWsErr || !ws) {
      return <ErrorDisplay title="Erro criando workspace" detail={JSON.stringify(createWsErr, null, 2)} />
    }

    firstSlug = ws.slug
  }

  // 5. Redireciona
  redirect(`/workspaces/${firstSlug}/pautas`)
}
