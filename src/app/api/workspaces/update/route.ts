import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { id, name, slug, color, description } = await request.json()
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    // Verifica se o usuário é membro do workspace (via organização)
    const { data: ws } = await admin.from('workspaces').select('organization_id').eq('id', id).single()
    if (!ws) return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })

    const { data: member } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', ws.organization_id)
      .eq('user_id', user.id)
      .single()
    if (!member) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const updates: any = {}
    if (name !== undefined)        updates.name = name
    if (slug !== undefined)        updates.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (color !== undefined)       updates.color = color
    if (description !== undefined) updates.description = description || null

    const { data, error } = await admin
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, workspace: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}
