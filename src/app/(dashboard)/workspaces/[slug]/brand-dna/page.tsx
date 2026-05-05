import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BrandDnaWizard } from '@/components/brand-dna/brand-dna-wizard'
import { DEMO_MODE, demoWorkspaces, demoBrandDna } from '@/lib/demo-data'

interface Props {
  params: { slug: string }
}

export default async function BrandDnaPage({ params }: Props) {
  if (DEMO_MODE) {
    const workspace = demoWorkspaces.find(ws => ws.slug === params.slug)
    if (!workspace) notFound()
    return <BrandDnaWizard workspace={workspace} initialDna={demoBrandDna} />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase.from('workspaces').select('*').eq('slug', params.slug).single()
  if (!workspace) notFound()

  const { data: brandDna } = await supabase.from('brand_dna').select('*').eq('workspace_id', workspace.id).single()
  return <BrandDnaWizard workspace={workspace} initialDna={brandDna} />
}
