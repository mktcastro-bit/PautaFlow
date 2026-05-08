import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { workspace_id, title, description, category, platform, format, tags } = body

    if (!workspace_id || !title) {
      return NextResponse.json({ error: 'workspace_id e title são obrigatórios' }, { status: 400 })
    }

    const admin = await createAdminClient()

    const { data, error } = await admin
      .from('pautas')
      .insert({
        workspace_id,
        title,
        description: description || null,
        category: category || 'Geral',
        platform: Array.isArray(platform) ? platform : [platform].filter(Boolean),
        format: format || 'post',
        status: 'ideia',
        tags: tags || [],
        priority: 'media',
        created_by: user.id,
      })
      .select('id, title')
      .single()

    if (error) {
      console.error('[pautas] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, pauta: data })
  } catch (err: any) {
    console.error('[pautas] unexpected error:', err)
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const { id, title, description, category, platform, format, tags } = body

    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (platform !== undefined) updates.platform = Array.isArray(platform) ? platform : [platform].filter(Boolean)
    if (format !== undefined) updates.format = format
    if (tags !== undefined) updates.tags = tags

    const { data, error } = await admin
      .from('pautas')
      .update(updates)
      .eq('id', id)
      .select('id, title')
      .single()

    if (error) {
      console.error('[pautas] update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, pauta: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 })
  }
}
