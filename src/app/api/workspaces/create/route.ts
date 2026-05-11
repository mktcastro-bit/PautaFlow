import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { LIMITS, type Plan } from '@/lib/usage-limits'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { name, slug: rawSlug, color, description } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    // Pega a organização do usuário
    const { data: member } = await admin
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()
    if (!member) return NextResponse.json({ error: 'Sem organização' }, { status: 403 })

    // Verifica plano + limite de workspaces
    const { data: org } = await admin
      .from('organizations')
      .select('plan')
      .eq('id', member.organization_id)
      .single()
    const plan: Plan = (org?.plan as Plan) || 'trial'
    const maxWs = LIMITS[plan].workspaces

    const { count } = await admin
      .from('workspaces')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', member.organization_id)
    if ((count || 0) >= maxWs) {
      return NextResponse.json({
        error: `Limite de ${maxWs} workspace(s) atingido no plano ${plan}.`,
        hint: 'Faça upgrade do plano para criar mais workspaces.',
      }, { status: 402 })
    }

    // Normaliza slug
    const baseSlug = (rawSlug?.trim() || name.trim())
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'workspace'

    // Garante slug único na org
    let slug = baseSlug
    let attempt = 1
    while (true) {
      const { data: exists } = await admin
        .from('workspaces')
        .select('id')
        .eq('organization_id', member.organization_id)
        .eq('slug', slug)
        .maybeSingle()
      if (!exists) break
      attempt++
      slug = `${baseSlug}-${attempt}`
      if (attempt > 20) return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }

    const { data: ws, error } = await admin
      .from('workspaces')
      .insert({
        organization_id: member.organization_id,
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color || '#c9a86a',
        created_by: user.id,
      })
      .select('*').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, workspace: ws })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}
