import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { organization_id, email, role } = await request.json()
    if (!organization_id || !email) {
      return NextResponse.json({ error: 'organization_id e email obrigatórios' }, { status: 400 })
    }

    const admin = await createAdminClient()

    // Verifica permissão do solicitante
    const { data: me } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', organization_id)
      .eq('user_id', user.id)
      .single()
    if (!me || (me.role !== 'owner' && me.role !== 'admin')) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Procura usuário pelo email — se não existe, cria
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 })
    let target = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!target) {
      // Cria usuário sem senha (envia email de definir senha)
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pauta-flow-one.vercel.app'}/login`,
      })
      if (inviteErr) return NextResponse.json({ error: inviteErr.message }, { status: 500 })
      target = invited.user
    }

    if (!target) return NextResponse.json({ error: 'Falha ao processar usuário' }, { status: 500 })

    // Verifica se já é membro
    const { data: existing } = await admin
      .from('organization_members')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('user_id', target.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Esse e-mail já é membro' }, { status: 400 })
    }

    // Cria o membership
    const { error } = await admin
      .from('organization_members')
      .insert({
        organization_id,
        user_id: target.id,
        role: role || 'editor',
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, email: target.email })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}
