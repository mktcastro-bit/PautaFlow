import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Verifica autenticação
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const payload = await request.json()
    if (!payload.workspace_id) return NextResponse.json({ error: 'workspace_id obrigatório' }, { status: 400 })

    // Usa admin client para ignorar RLS
    const admin = await createAdminClient()

    const { error } = await admin
      .from('brand_dna')
      .upsert(payload, { onConflict: 'workspace_id' })

    if (error) {
      console.error('[brand/dna] save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[brand/dna] unexpected error:', err)
    return NextResponse.json({ error: err?.message || 'Erro desconhecido' }, { status: 500 })
  }
}
