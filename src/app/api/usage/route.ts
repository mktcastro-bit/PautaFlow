import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGenerationLimit } from '@/lib/usage-limits'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const url = new URL(request.url)
    const workspaceId = url.searchParams.get('workspace_id')
    if (!workspaceId) return NextResponse.json({ error: 'workspace_id obrigatório' }, { status: 400 })

    const limit = await checkGenerationLimit(workspaceId)
    return NextResponse.json(limit)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}
