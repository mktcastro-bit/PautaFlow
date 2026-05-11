import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { BrandDNA } from '@/types'
import { FORMULAS, FORMULA_ORDER } from '@/lib/viral-formulas'

const DEMO_IDEAS = FORMULA_ORDER.map((key, i) => ({
  formula: key,
  title: [
    'Sem tempo, mas quer estruturar marca? Salve estas 5 ações',
    'Construindo presença digital? Os 5 passos que realmente importam',
    'Se eu começasse uma marca hoje, faria essas 7 coisas',
    'Esse cliente cresceu 300% sem ads. O que ele fez diferente.',
    'Aos 30 e quer construir autoridade? 6 decisões inadiáveis',
  ][i],
  subtitle: [
    'O que não precisa ser perfeito desde já — e o que precisa.',
    'Esquece o cronograma rígido. Foca no que move o ponteiro.',
    'O que eu não faria, e o que faria primeiro.',
    'A escolha estratégica que poucos têm coragem de fazer.',
    'O que parece atalho — e o que de fato move o ponteiro.',
  ][i],
}))

function buildIdeasPrompt(
  pilar: string,
  platform: string,
  format: string,
  suggestion: string | undefined,
  dna: Partial<BrandDNA>
): string {
  const tone = dna.step3_tone?.join(', ') || 'direto e estratégico'
  const audience = (dna as any).step2_target_audience || (dna as any).step2_roles?.join(', ') || 'empreendedores e gestores'
  const avoid = dna.step3_avoid_words?.join(', ') || ''
  const preferred = dna.step3_preferred_words?.join(', ') || ''
  const brand = dna.step1_brand_name || 'a marca'
  const differentiator = dna.step5_differentiators || ''
  const pain = (dna as any).step2_pain_points?.join(', ') || ''

  // Lista as 5 fórmulas para a IA
  const formulasBlock = FORMULA_ORDER.map((k, i) => {
    const f = FORMULAS[k]
    return `${i + 1}. **${f.label}** (${f.shortName})
   - ${f.description}
   - Exemplo: ${f.example}`
  }).join('\n\n')

  return `Você é o estrategista de conteúdo de ${brand}.

## Contexto da Marca
- Tom de voz: ${tone}
- Público: ${audience}
${pain ? `- Dor principal: ${pain}` : ''}
- Diferencial: ${differentiator}
${avoid ? `- Evitar: ${avoid}` : ''}
${preferred ? `- Vocabulário preferido: ${preferred}` : ''}

## Briefing
- Pilar: ${pilar}
- Plataforma: ${platform}
- Formato: ${format}
${suggestion ? `- Sugestão do usuário: ${suggestion}` : ''}

## Fórmulas virais comprovadas
Você vai gerar EXATAMENTE 5 ideias, UMA para cada fórmula abaixo:

${formulasBlock}

## Tarefa
Para cada uma das 5 fórmulas, gere uma ideia de conteúdo APLICANDO a estrutura da fórmula ao pilar "${pilar}".

Cada ideia deve ter:
- **formula**: chave da fórmula (atalho, guia, conselho, case, marco)
- **title**: título que SEGUE a estrutura da fórmula (máx 14 palavras)
- **subtitle**: frase complementar que aprofunda o ângulo (máx 18 palavras)

REGRAS CRÍTICAS:
1. Cada ideia DEVE seguir a estrutura da sua respectiva fórmula
2. NÃO seja genérico — o título precisa entregar a fórmula claramente
3. Use o tom e vocabulário da marca
4. Pense no formato ${format} para ${platform}

Retorne APENAS JSON válido, sem markdown:
[
  {"formula": "atalho",   "title": "...", "subtitle": "..."},
  {"formula": "guia",     "title": "...", "subtitle": "..."},
  {"formula": "conselho", "title": "...", "subtitle": "..."},
  {"formula": "case",     "title": "...", "subtitle": "..."},
  {"formula": "marco",    "title": "...", "subtitle": "..."}
]`
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    await new Promise(r => setTimeout(r, 1500))
    return NextResponse.json({ ideas: DEMO_IDEAS })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { workspace_id, pilar, platform, format, suggestion, brand_dna } = body

  if (!workspace_id || !pilar) {
    return NextResponse.json({ error: 'workspace_id e pilar são obrigatórios' }, { status: 400 })
  }

  const prompt = buildIdeasPrompt(pilar, platform, format, suggestion, brand_dna || {})

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    const ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ ideas })
  } catch (err) {
    console.error('Ideas generation error:', err)
    return NextResponse.json({ error: 'Erro ao gerar ideias' }, { status: 500 })
  }
}
