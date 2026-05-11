import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CalendarClient } from '@/components/calendar/calendar-client'
import { DEMO_MODE, demoWorkspaces, demoCalendarEvents, demoPautas } from '@/lib/demo-data'

interface Props {
  params: { slug: string }
}

export default async function CalendarPage({ params }: Props) {
  if (DEMO_MODE) {
    const workspace = demoWorkspaces.find(ws => ws.slug === params.slug)
    if (!workspace) notFound()
    const pautas = demoPautas.map(p => ({ id: p.id, title: p.title, platform: p.platform, format: p.format, status: p.status }))
    return <CalendarClient workspace={workspace} events={demoCalendarEvents} pautas={pautas} dnaIncomplete={false} />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = await createAdminClient()

  const { data: workspace } = await admin.from('workspaces').select('*').eq('slug', params.slug).single()
  if (!workspace) notFound()

  // 3 meses para frente e 1 mês para trás
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 3, 0)

  const { data: events } = await admin
    .from('calendar_events').select('*').eq('workspace_id', workspace.id)
    .gte('scheduled_date', start.toISOString().split('T')[0])
    .lte('scheduled_date', end.toISOString().split('T')[0])
    .order('scheduled_date')

  const { data: pautas } = await admin
    .from('pautas').select('id, title, platform, format, status')
    .eq('workspace_id', workspace.id)
    .in('status', ['ideia', 'em_desenvolvimento', 'aprovado'])
    .order('title')

  // DNA pendente?
  const { data: dna } = await admin
    .from('brand_dna').select('completed').eq('workspace_id', workspace.id).maybeSingle()

  return (
    <CalendarClient
      workspace={workspace}
      events={events || []}
      pautas={pautas || []}
      dnaIncomplete={!dna?.completed}
    />
  )
}
