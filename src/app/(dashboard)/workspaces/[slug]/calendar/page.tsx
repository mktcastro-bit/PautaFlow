import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
    return <CalendarClient workspace={workspace} events={demoCalendarEvents} pautas={pautas} />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase.from('workspaces').select('*').eq('slug', params.slug).single()
  if (!workspace) notFound()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const { data: events } = await supabase
    .from('calendar_events').select('*').eq('workspace_id', workspace.id)
    .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
    .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
    .order('scheduled_date')

  const { data: pautas } = await supabase
    .from('pautas').select('id, title, platform, format, status')
    .eq('workspace_id', workspace.id)
    .in('status', ['ideia', 'em_desenvolvimento', 'aprovado'])
    .order('title')

  return <CalendarClient workspace={workspace} events={events || []} pautas={pautas || []} />
}
