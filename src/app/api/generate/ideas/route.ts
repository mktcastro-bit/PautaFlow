import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { mapAnthropicError } from '@/lib/anthropic/errors'
import { withRetry } from '@/lib/anthropic/retry'
import { BrandDNA } from '@/types'
import { FORMULAS, FORMULA_ORDER } from '@/lib/viral-formulas'
import { buildSuggestionBlock, type SuggestionMode } from '@/lib/suggestion-mode'
import { buildExtractedContentBlock } from '@/lib/brand-content'

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
  suggestionMode: SuggestionMode,
  isTrends: boolean,
  dna: Partial<BrandDNA>
): string {
  const tone = dna.step3_tone?.join(', ') || 'direto e estratégico'
  const audience = (dna as any).step2_target_audience || (dna as any).step2_roles?.join(', ') || 'empreendedores e gestores'
  const avoid = dna.step3_avoid_words?.join(', ') || ''
  const preferred = dna.step3_preferred_words?.join(', ') || ''
  const brand = dna.step1_brand_name || 'a marca'
  const offerings = (dna as any).step1_offerings || ''
  const differentiator = dna.step5_differentiators || ''
  const pain = (dna as any).step2_pain_points?.join(', ') || ''

  // Lista as 5 fórmulas para a IA
  const formulasBlock = FORMULA_ORDER.map((k, i) => {
    const f = FORMULAS[k]
    return `${i + 1}. **${f.label}** (${f.shortName})
   - ${f.description}
   - Exemplo: ${f.example}`
  }).join('\n\n')

  // Conteúdo extraído do site da marca — cases, ofertas, tópicos, vocabulário
  const extractedBlock = buildExtractedContentBlock(dna)

  return `Você é o estrategista de conteúdo de ${brand}.

## Contexto da Marca
${offerings ? `- O que oferece: ${offerings}` : ''}
- Tom de voz: ${tone}
- Público: ${audience}
${pain ? `- Dor principal: ${pain}` : ''}
- Diferencial: ${differentiator}
${avoid ? `- Evitar: ${avoid}` : ''}
${preferred ? `- Vocabulário preferido: ${preferred}` : ''}

${extractedBlock}

## Briefing
- Pilar: ${pilar}
- Plataforma: ${platform}
- Formato: ${format}

${buildSuggestionBlock(suggestion, suggestionMode, isTrends)}

## Fórmulas virais comprovadas
Você vai gerar EXATAMENTE 5 ideias, UMA para cada fórmula abaixo:

${formulasBlock}

## Tarefa
Para cada uma das 5 fórmulas, gere uma ideia de conteúdo APLICANDO a estrutura da fórmula ao pilar "${pilar}"${suggestion && suggestionMode !== 'hint' ? ', usando o CONTEÚDO BASE acima como fonte/ponto de partida' : ''}.

Cada ideia deve ter:
- **formula**: chave da fórmula (atalho, guia, conselho, case, marco)
- **title**: título que SEGUE a estrutura da fórmula (máx 14 palavras)
- **subtitle**: frase complementar que aprofunda o ângulo (máx 18 palavras)

REGRAS CRÍTICAS:
1. Cada ideia DEVE seguir a estrutura da sua respectiva fórmula
2. NÃO seja genérico — o título precisa entregar a fórmula claramente
3. Use o tom e vocabulário da marca${extractedBlock ? ' (priorize termos e cases REAIS extraídos do site acima)' : ''}
4. Pense no formato ${format} para ${platform}${extractedBlock ? '\n5. Quando fizer sentido, ancore o conteúdo em cases/ofertas reais da marca em vez de exemplos genéricos' : ''}
6. NUNCA use travessão (\`—\`) nem meia-risca (\`–\`) em title ou subtitle. Use vírgula, ponto ou parênteses.

Retorne APENAS JSON válido, sem markdown:
[
  {"formula": "atalho",   "title": "...", "subtitle": "..."},
  {"formula": "guia",     "title": "...", "subtitle": "..."},
  {"formula": "conselho", "title": "...", "subtitle": "..."},
  {"formula": "case",     "title": "...", "subtitle": "..."},
  {"formula": "marco",    "title": "...", "subtitle": "..."}
]`
}

/**
 * No modo trends, esperamos JSON { ideas: [...], news: {...} }
 * Extrai esse objeto com fallbacks.
 */
function extractTrendsResponse(raw: string): { ideas: any[]; news: any | null } {
  if (!raw?.trim()) return { ideas: [], news: null }

  // 1) Bloco ```json {...} ```
  const fenceMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (fenceMatch) {
    try {
      const obj = JSON.parse(fenceMatch[1])
      if (obj && Array.isArray(obj.ideas)) return { ideas: obj.ideas, news: obj.news || null }
    } catch {}
  }

  // 2) Último objeto JSON com campo "ideas"
  const candidates = [...raw.matchAll(/\{[\s\S]*?\}(?=\s|$|,)/g)].map(m => m[0])
  for (const candidate of candidates.reverse()) {
    try {
      const obj = JSON.parse(candidate)
      if (obj && Array.isArray(obj.ideas)) return { ideas: obj.ideas, news: obj.news || null }
    } catch {}
  }

  // 3) Greedy match — primeiro { até último }
  const greedy = raw.match(/\{[\s\S]*\}/)
  if (greedy) {
    try {
      const obj = JSON.parse(greedy[0])
      if (obj && Array.isArray(obj.ideas)) return { ideas: obj.ideas, news: obj.news || null }
    } catch {}
  }

  return { ideas: [], news: null }
}

/**
 * Extrai array de ideias da resposta crua (robusto a múltiplos blocks e prosa).
 */
function extractIdeasArray(raw: string): any[] {
  if (!raw?.trim()) return []

  // 1) Bloco ```json [...] ```
  const fenceMatch = raw.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
  if (fenceMatch) {
    try {
      const arr = JSON.parse(fenceMatch[1])
      if (Array.isArray(arr) && arr.length) return arr
    } catch {}
  }

  // 2) Último array balanceado (Claude pode falar texto antes)
  const candidates = [...raw.matchAll(/\[[\s\S]*?\]/g)].map(m => m[0])
  for (const candidate of candidates.reverse()) {
    try {
      const arr = JSON.parse(candidate)
      if (Array.isArray(arr) && arr.length && arr[0]?.title) return arr
    } catch {}
  }

  // 3) Greedy — primeiro [ até último ]
  const greedy = raw.match(/\[[\s\S]*\]/)
  if (greedy) {
    try {
      const arr = JSON.parse(greedy[0])
      if (Array.isArray(arr)) return arr
    } catch {}
  }

  return []
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
  const { workspace_id, pilar, platform, format, suggestion, suggestion_mode, brand_dna, use_web_search } = body

  if (!workspace_id || !pilar) {
    return NextResponse.json({ error: 'workspace_id e pilar são obrigatórios' }, { status: 400 })
  }

  const mode: SuggestionMode = (suggestion_mode as SuggestionMode) || 'hint'
  const isTrends = !!use_web_search && mode === 'news'
  const prompt = buildIdeasPrompt(pilar, platform, format, suggestion, mode, isTrends, brand_dna || {})

  try {
    const message = await withRetry(() => anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: use_web_search ? 6000 : 1200,
      messages: [{ role: 'user', content: prompt }],
      ...(use_web_search && {
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 4,
        }] as any,
      }),
    }))

    // Concatena todos os text blocks (web_search retorna múltiplos turnos)
    let raw = ''
    for (const block of message.content) {
      if (block.type === 'text') raw += '\n' + block.text
    }

    // No modo trends, esperamos JSON { ideas, news }; nos outros, só array de ideias
    let ideas: any[] = []
    let news: any = null

    if (isTrends) {
      const obj = extractTrendsResponse(raw)
      ideas = obj.ideas || []
      news = obj.news || null

      // Validação adicional: news precisa ter campos mínimos
      if (!news || !news.headline || !news.source) {
        console.error('[ideas/trends] news inválida ou ausente. Raw (800 chars):', raw.slice(0, 800))
        return NextResponse.json({
          error: 'A IA não conseguiu validar uma notícia confiável sobre esse pilar.',
          hint: 'Tente outro pilar com mais cobertura na mídia, adicione foco no campo abaixo, ou use "Colar notícia" pra fornecer o texto.',
        }, { status: 502 })
      }
    } else {
      ideas = extractIdeasArray(raw)
    }

    if (!ideas.length) {
      console.error('[ideas] no ideas extracted. Raw response (first 800 chars):', raw.slice(0, 800))
      return NextResponse.json({
        error: 'Não consegui extrair ideias da resposta da IA.',
        hint: use_web_search
          ? 'A busca em tempo real pode não ter encontrado notícia relevante. Tente outro pilar.'
          : 'Tente novamente em alguns segundos.',
      }, { status: 502 })
    }

    return NextResponse.json({ ideas, news })
  } catch (err: any) {
    console.error('[ideas] generation error:', err?.status, err?.message)
    const friendly = mapAnthropicError(err)
    return NextResponse.json(
      { error: friendly.message, hint: friendly.hint, type: friendly.type },
      { status: friendly.status }
    )
  }
}
