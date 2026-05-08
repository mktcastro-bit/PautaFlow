import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    const { data: ws } = await admin.from('workspaces').select('organization_id').eq('id', id).single()
    if (!ws) return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })

    const { data: me } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', ws.organization_id)
      .eq('user_id', user.id)
      .single()
    if (!me || (me.role !== 'owner' && me.role !== 'admin')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Conta workspaces da org — não pode deletar o único
    const { count } = await admin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', ws.organization_id)
    if ((count || 0) <= 1) {
      return NextResponse.json({ error: 'Você precisa de pelo menos 1 workspace ativo' }, { status: 400 })
    }

    const { error } = await admin.from('workspaces').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}
