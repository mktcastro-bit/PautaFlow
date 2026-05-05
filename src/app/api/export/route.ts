import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExportData } from '@/types'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspace_id')

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const { data: pautas } = await supabase
    .from('pautas')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at')

  const { data: calendarEvents } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('scheduled_date')

  const { data: brandDna } = await supabase
    .from('brand_dna')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()

  const exportData: ExportData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    workspace_name: workspace.name,
    brand_dna: brandDna || undefined,
    pautas: pautas || [],
    calendar_events: calendarEvents || [],
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="pautaflow-${workspace.slug}-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
