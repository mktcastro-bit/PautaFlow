import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET ?organization_id=xxx — lista membros
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const url = new URL(request.url)
    const orgId = url.searchParams.get('organization_id')
    if (!orgId) return NextResponse.json({ error: 'organization_id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    // Verifica que o usuário pertence à org
    const { data: me } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()
    if (!me) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    // Busca membros
    const { data: members } = await admin
      .from('organization_members')
      .select('id, user_id, role, created_at')
      .eq('organization_id', orgId)
      .order('created_at')

    // Pega emails via auth admin
    const enriched = await Promise.all((members || []).map(async (m) => {
      const { data: u } = await admin.auth.admin.getUserById(m.user_id)
      return {
        id: m.id,
        user_id: m.user_id,
        email: u.user?.email || '—',
        role: m.role,
        created_at: m.created_at,
        is_self: m.user_id === user.id,
      }
    }))

    return NextResponse.json({ members: enriched, current_role: me.role })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

// DELETE ?id=xxx — remove membro
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const url = new URL(request.url)
    const memberId = url.searchParams.get('id')
    if (!memberId) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    // Busca o membro para validar permissão
    const { data: target } = await admin
      .from('organization_members')
      .select('organization_id, user_id, role')
      .eq('id', memberId)
      .single()
    if (!target) return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })

    // Verifica permissão (deve ser owner/admin da mesma org)
    const { data: me } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', target.organization_id)
      .eq('user_id', user.id)
      .single()
    if (!me || (me.role !== 'owner' && me.role !== 'admin')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Não deixa remover o owner principal
    if (target.role === 'owner') {
      return NextResponse.json({ error: 'Não é possível remover o owner' }, { status: 400 })
    }

    const { error } = await admin.from('organization_members').delete().eq('id', memberId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}
