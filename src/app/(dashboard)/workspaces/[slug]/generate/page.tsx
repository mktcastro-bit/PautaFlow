import { notFound, redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { GenerateFlow } from '@/components/generate/generate-flow'
import { DEMO_MODE, demoWorkspaces, demoBrandDna } from '@/lib/demo-data'

interface Props {
  params: { slug: string }
  searchParams: { pauta_id?: string }
}

export default async function GeneratePage({ params, searchParams }: Props) {
  if (DEMO_MODE) {
    const workspace = demoWorkspaces.find(ws => ws.slug === params.slug)
    if (!workspace) notFound()
    const pilars = demoBrandDna.step5_content_pillars || []
    return (
      <GenerateFlow
        workspace={workspace}
        brandDna={demoBrandDna}
        pilars={pilars}
        initialPauta={null}
      />
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = await createAdminClient()

  const { data: workspace } = await admin
    .from('workspaces').select('*').eq('slug', params.slug).single()
  if (!workspace) notFound()

  const { data: brandDna } = await admin
    .from('brand_dna').select('*').eq('workspace_id', workspace.id).single()

  const pilars = brandDna?.step5_content_pillars || []

  // Carrega pauta se veio via ?pauta_id=
  let initialPauta = null
  if (searchParams.pauta_id) {
    const { data } = await admin
      .from('pautas')
      .select('*')
      .eq('id', searchParams.pauta_id)
      .eq('workspace_id', workspace.id)
      .single()
    initialPauta = data
  }

  return (
    <GenerateFlow
      workspace={workspace}
      brandDna={brandDna}
      pilars={pilars}
      initialPauta={initialPauta}
    />
  )
}
