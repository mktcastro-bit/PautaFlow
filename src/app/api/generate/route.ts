import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/anthropic'
import { PautaFormat } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { workspace_id, pauta_id, platform, format, custom_instructions } = body

  if (!workspace_id || !platform || !format) {
    return NextResponse.json({ error: 'workspace_id, platform and format are required' }, { status: 400 })
  }

  // Verificar acesso ao workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, organization_id')
    .eq('id', workspace_id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  // Verificar limite de gerações do plano
  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', workspace.organization_id)
    .single()

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  if (org.plan === 'starter') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('generated_content')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspace_id)
      .gte('created_at', startOfMonth.toISOString())

    if ((count || 0) >= 20) {
      return NextResponse.json({
        error: 'Limite de gerações atingido. Faça upgrade para continuar.'
      }, { status: 403 })
    }
  }

  // Buscar dados da pauta e DNA
  let pautaTitle = body.pauta_title || 'Conteúdo personalizado'
  let pautaDescription = body.pauta_description

  if (pauta_id) {
    const { data: pauta } = await supabase
      .from('pautas')
      .select('title, description')
      .eq('id', pauta_id)
      .single()

    if (pauta) {
      pautaTitle = pauta.title
      pautaDescription = pauta.description
    }
  }

  const { data: brandDna } = await supabase
    .from('brand_dna')
    .select('*')
    .eq('workspace_id', workspace_id)
    .single()

  try {
    const result = await generateContent(
      {
        pauta_title: pautaTitle,
        pauta_description: pautaDescription,
        platform,
        format: format as PautaFormat,
        custom_instructions,
      },
      brandDna || undefined
    )

    // Salvar no histórico
    await supabase.from('generated_content').insert({
      workspace_id,
      pauta_id: pauta_id || null,
      content: result.content,
      prompt_used: result.promptUsed,
      model: 'claude-sonnet-4-6',
      platform,
      format,
      tokens_used: result.tokensUsed,
      created_by: user.id,
    })

    return NextResponse.json({ content: result.content, tokens_used: result.tokensUsed })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Erro ao gerar conteúdo' }, { status: 500 })
  }
}
