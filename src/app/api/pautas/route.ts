import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/** Revalida as rotas que listam pautas para esse workspace */
async function revalidateWorkspaceRoutes(admin: any, workspaceId: string) {
  try {
    const { data: ws } = await admin.from('workspaces').select('slug').eq('id', workspaceId).single()
    if (ws?.slug) {
      revalidatePath(`/workspaces/${ws.slug}/pautas`)
      revalidatePath(`/workspaces/${ws.slug}/calendar`)
    }
  } catch {
    // silenciar — revalidação é "best effort"
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await request.json()
    const {
      workspace_id, title, description, category, platform, format, tags,
      slides, editor_state, caption,
    } = body

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
        slides: slides || null,
        editor_state: editor_state || null,
        caption: caption || null,
      })
      .select('id, title')
      .single()

    if (error) {
      console.error('[pautas] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await revalidateWorkspaceRoutes(admin, workspace_id)
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
    const {
      id, title, description, category, platform, format, tags,
      slides, editor_state, caption, status,
    } = body

    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    const updates: any = {}
    if (title !== undefined)        updates.title = title
    if (description !== undefined)  updates.description = description
    if (category !== undefined)     updates.category = category
    if (platform !== undefined)     updates.platform = Array.isArray(platform) ? platform : [platform].filter(Boolean)
    if (format !== undefined)       updates.format = format
    if (tags !== undefined)         updates.tags = tags
    if (status !== undefined)       updates.status = status
    if (slides !== undefined)       updates.slides = slides
    if (editor_state !== undefined) updates.editor_state = editor_state
    if (caption !== undefined)      updates.caption = caption

    const { data, error } = await admin
      .from('pautas')
      .update(updates)
      .eq('id', id)
      .select('id, title, workspace_id')
      .single()

    if (error) {
      console.error('[pautas] update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (data?.workspace_id) {
      await revalidateWorkspaceRoutes(admin, data.workspace_id)
    }
    return NextResponse.json({ ok: true, pauta: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

    const admin = await createAdminClient()

    // Buscar workspace_id antes de deletar pra poder revalidar
    const { data: existing } = await admin
      .from('pautas')
      .select('workspace_id')
      .eq('id', id)
      .single()

    const { error } = await admin.from('pautas').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (existing?.workspace_id) {
      await revalidateWorkspaceRoutes(admin, existing.workspace_id)
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 })
  }
}
