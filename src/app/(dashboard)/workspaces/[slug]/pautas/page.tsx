import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { PautasClient } from '@/components/pautas/pautas-client'
import { DEMO_MODE, demoWorkspaces, demoPautas } from '@/lib/demo-data'

interface Props {
  params: { slug: string }
  searchParams: { [key: string]: string | undefined }
}

export default async function PautasPage({ params, searchParams }: Props) {
  if (DEMO_MODE) {
    const workspace = demoWorkspaces.find(ws => ws.slug === params.slug)
    if (!workspace) notFound()

    let pautas = demoPautas.filter(p => p.workspace_id === workspace.id)
    if (searchParams.status) pautas = pautas.filter(p => p.status === searchParams.status)
    if (searchParams.category) pautas = pautas.filter(p => p.category === searchParams.category)
    if (searchParams.search) pautas = pautas.filter(p => p.title.toLowerCase().includes(searchParams.search!.toLowerCase()))

    const categories = [...new Set(demoPautas.map(p => p.category))]
    return <PautasClient pautas={pautas} workspace={workspace} categories={categories} filters={searchParams} />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = await createAdminClient()

  const { data: workspace } = await admin
    .from('workspaces').select('*').eq('slug', params.slug).single()
  if (!workspace) notFound()

  let query = admin.from('pautas').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false })
  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.format) query = query.eq('format', searchParams.format)
  if (searchParams.priority) query = query.eq('priority', searchParams.priority)
  if (searchParams.search) query = query.ilike('title', `%${searchParams.search}%`)
  if (searchParams.platform) query = query.contains('platform', [searchParams.platform])

  const { data: pautas } = await query
  const { data: categories } = await admin.from('pautas').select('category').eq('workspace_id', workspace.id)
  const uniqueCategories = [...new Set(categories?.map(p => p.category) || [])]

  // DNA pendente?
  const { data: dna } = await admin
    .from('brand_dna')
    .select('completed')
    .eq('workspace_id', workspace.id)
    .maybeSingle()
  const dnaIncomplete = !dna?.completed

  return (
    <PautasClient
      pautas={pautas || []}
      workspace={workspace}
      categories={uniqueCategories}
      filters={searchParams}
      dnaIncomplete={dnaIncomplete}
    />
  )
}
