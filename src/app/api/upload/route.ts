import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const BUCKET = 'pauta-media'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024   // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024  // 20MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const workspaceId = formData.get('workspace_id') as string | null

    if (!file) return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })
    if (!workspaceId) return NextResponse.json({ error: 'workspace_id obrigatório' }, { status: 400 })

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json({
        error: 'Tipo de arquivo não suportado',
        hint: 'Aceitamos: JPG, PNG, WebP, GIF, MP4, MOV, WebM',
      }, { status: 400 })
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      const limitMB = maxSize / 1024 / 1024
      return NextResponse.json({
        error: `Arquivo muito grande. Máximo ${limitMB}MB para ${isImage ? 'imagens' : 'vídeos'}.`,
      }, { status: 400 })
    }

    const admin = await createAdminClient()

    // Verifica acesso ao workspace
    const { data: ws } = await admin
      .from('workspaces')
      .select('organization_id')
      .eq('id', workspaceId)
      .single()
    if (!ws) return NextResponse.json({ error: 'Workspace inexistente' }, { status: 404 })

    const { data: member } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', ws.organization_id)
      .eq('user_id', user.id)
      .single()
    if (!member) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    // Nome único: workspaceId/timestamp-randomslug-filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safe = file.name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9._-]+/g, '-')
      .slice(0, 60)
    const path = `${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`

    // Upload
    const buffer = await file.arrayBuffer()
    const { error: uploadErr } = await admin
      .storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
      })

    if (uploadErr) {
      console.error('[upload] storage error:', uploadErr)
      return NextResponse.json({ error: uploadErr.message || 'Falha no upload' }, { status: 500 })
    }

    // URL pública
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({
      ok: true,
      media: {
        url: pub.publicUrl,
        type: isImage ? 'image' : 'video',
        name: file.name,
        size: file.size,
      },
    })
  } catch (err: any) {
    console.error('[upload] unexpected error:', err)
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 })
  }
}
