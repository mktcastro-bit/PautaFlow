import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { workspace_id, title, pauta_id, scheduled_date, scheduled_time, platform, color, status } = body

    if (!workspace_id || !scheduled_date) {
      return NextResponse.json({ error: 'workspace_id e scheduled_date são obrigatórios' }, { status: 400 })
    }

    const admin = await createAdminClient()
    const { data, error } = await admin
      .from('calendar_events')
      .insert({
        workspace_id,
        title: title || 'Evento',
        pauta_id: pauta_id || null,
        scheduled_date,
        scheduled_time: scheduled_time || null,
        platform: Array.isArray(platform) ? platform : [],
        color: color || '#c9a86a',
        status: status || 'agendado',
        created_by: user.id,
      })
      .select('*').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, event: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { id, ...rest } = body
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()
    const updates: any = {}
    for (const k of ['title', 'pauta_id', 'scheduled_date', 'scheduled_time', 'platform', 'color', 'status']) {
      if (rest[k] !== undefined) updates[k] = rest[k]
    }

    const { data, error } = await admin.from('calendar_events').update(updates).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, event: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()
    const { error } = await admin.from('calendar_events').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}
