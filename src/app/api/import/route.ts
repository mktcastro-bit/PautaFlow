import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExportData } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { workspace_id, data }: { workspace_id: string; data: ExportData } = body

  if (!workspace_id || !data) {
    return NextResponse.json({ error: 'workspace_id and data required' }, { status: 400 })
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspace_id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  let importedCount = { pautas: 0, events: 0 }

  // Importar pautas
  if (data.pautas && data.pautas.length > 0) {
    const pautasToInsert = data.pautas.map(({ id, workspace_id: _wid, created_at, updated_at, ...rest }) => ({
      ...rest,
      workspace_id,
      created_by: user.id,
    }))

    const { data: inserted } = await supabase
      .from('pautas')
      .insert(pautasToInsert)
      .select('id')

    importedCount.pautas = inserted?.length || 0
  }

  // Importar eventos do calendário
  if (data.calendar_events && data.calendar_events.length > 0) {
    const eventsToInsert = data.calendar_events.map(({ id, workspace_id: _wid, pauta_id: _pid, created_at, updated_at, ...rest }) => ({
      ...rest,
      workspace_id,
      pauta_id: null,
      created_by: user.id,
    }))

    const { data: inserted } = await supabase
      .from('calendar_events')
      .insert(eventsToInsert)
      .select('id')

    importedCount.events = inserted?.length || 0
  }

  return NextResponse.json({
    success: true,
    imported: importedCount,
  })
}
