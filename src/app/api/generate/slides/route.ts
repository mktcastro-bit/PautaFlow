import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { mapAnthropicError } from '@/lib/anthropic/errors'
import { BrandDNA } from '@/types'
import { getFormula } from '@/lib/viral-formulas'
import { checkGenerationLimit } from '@/lib/usage-limits'
import { buildSlidesInstructions, type SuggestionMode } from '@/lib/suggestion-mode'

const DEMO_SLIDES = {
  slides: [
    { number: 1, title: 'A IA não vai te substituir.', subtitle: 'A pessoa que sabe usar IA, vai.', callout: 'A escolha acontece agora.' },
    { number: 2, title: 'Sua empresa investiu em IA.',  subtitle: 'E os resultados não fecham com o esforço.', callout: 'Por quê?' },
    { number: 3, title: 'O problema raramente é a tecnologia.', subtitle: 'É o modelo comportamental que deveria anteceder cada automação.', callout: '' },
    { number: 4, title: '4 sinais de IA automatizando achismo.', subtitle: 'Quando ferramenta vira ruído operacional.', callout: '' },
    { number: 5, title: 'Antes da IA: o modelo humano.', subtitle: 'Comportamento define o que escalar — não o contrário.', callout: '' },
    { number: 6, title: 'Dado comportamental + decisão estratégica.', subtitle: 'A interseção onde a vantagem real acontece.', callout: '= Vantagem.' },
    { number: 7, title: 'Pare de escalar mensagens.', subtitle: 'Comece a escalar entendimento.', callout: '' },
    { number: 8, title: 'O que você está realmente escalando com IA?', subtitle: '', callout: 'Comente abaixo.' },
  ],
  caption: `Quando a tecnologia não parte do humano, ela apenas acelera decisões erradas.

Sua empresa investiu em IA. Integrou ferramentas. Automatizou fluxos. E os resultados ainda não fecham com o esforço.

O problema raramente é a tecnologia.

É o modelo comportamental que deveria anteceder cada automação.

IA sem estratégia humana clara é só custo com interface bonita.

O que você está realmente escalando com IA?

Comente abaixo 👇

#estrategia #ia #marketingdigital #crescimento #transformacaodigital`,
}

function buildSlidesPrompt(
  title: string,
  subtitle: string,
  pilar: string,
  platform: string,
  format: string,
  publicationFormat: string,
  variant: string,
  formula: string | undefined,
  suggestion: string | undefined,
  suggestionMode: SuggestionMode,
  isTrends: boolean,
  dna: Partial<BrandDNA>
): string {
  const tone = dna.step3_tone?.join(', ') || 'direto'
  const brand = dna.step1_brand_name || 'a marca'
  const offerings = (dna as any).step1_offerings || ''
  const audience = (dna as any).step2_target_audience || (dna as any).step2_roles?.join(', ') || 'empreendedores'
  const preferred = dna.step3_preferred_words?.join(', ') || ''

  const fmt = format.toLowerCase()
  const plat = platform.toLowerCase()

  let slideCount =
    fmt === 'carrossel' ? 8 :
    fmt === 'thread'    ? 10 :
    fmt === 'artigo'    ? 6 :
    fmt === 'reels'     ? (plat === 'tiktok' ? 5 : 1) :  // TikTok = 5 cenas; Reels Instagram = 1 roteiro
    fmt === 'stories'   ? (plat === 'whatsapp' ? 3 : 4) : // WhatsApp Status ideal = 3 cards
    1

  // Em modo literal, ajusta o número de slides ao tamanho do texto
  if (suggestionMode === 'literal' && suggestion) {
    const words = suggestion.trim().split(/\s+/).length
    // ~25-40 palavras por slide é confortável de ler
    const ideal = Math.max(2, Math.min(10, Math.round(words / 30)))
    slideCount = ideal
  }

  const platformGuide =
    plat === 'linkedin' ?
      'LinkedIn — mais texto, mais profundidade, storytelling corporativo. Parágrafos curtos. Sem emojis excessivos. Hashtags 3-5. Tom: profissional mas humano. Pode ser mais longo (1300-3000 chars na legenda).'

    : plat === 'instagram' ?
      'Instagram — direto, visual, impacto em poucos segundos. Hook forte no slide 1. Tom: visual, emocional, autoral. Hashtags 5-10. Legenda 500-2200 chars. Use emojis com moderação.'

    : plat === 'tiktok' ?
      'TikTok — pense em ROTEIRO DE VÍDEO vertical 15-60s. Os "slides" são CENAS sequenciais que serão filmadas. Slide 1 = gancho dos 3 primeiros segundos (frase que SEGURA o scroll). Tom coloquial, jovem, direto. Sem hashtag-spam (3-5 hashtags relevantes na legenda, foco em descobrabilidade). Cada slide deve representar uma cena/transição. Inclua microcopy do texto que aparece NA TELA do vídeo. CTA forte no último slide (siga, comente, compartilhe).'

    : plat === 'whatsapp' ?
      'WhatsApp Status / Canal — pessoal, íntimo, direto. NÃO use hashtags. Tom: como se estivesse mandando uma mensagem pra um amigo. Textos curtos (cada slide é um Status que dura 24h). Sem CTA agressivo de venda — foque em valor. Legenda mínima ou ausente. Slide final pode pedir reação/resposta privada.'

    :
      'Geral (Instagram e LinkedIn) — equilibre profundidade e impacto visual. Hashtags 5-7. Tom: profissional acessível.'

  // Bloco da fórmula viral (se selecionada)
  const formulaSpec = formula ? getFormula(formula) : null
  const formulaBlock = formulaSpec ? `

## Fórmula viral aplicada: ${formulaSpec.label} (${formulaSpec.shortName})
${formulaSpec.description}

Aplique essa estrutura ao desenvolver os slides. O slide 1 reflete o título com a abordagem desta fórmula.
Exemplo de aplicação: ${formulaSpec.example}` : ''

  // Bloco de instruções baseado no modo de sugestão
  const suggestionBlock = buildSlidesInstructions(suggestion, suggestionMode, slideCount, isTrends)

  return `Você é o copywriter de ${brand}.

## Ideia selecionada
- **Título**: ${title}
- **Subtítulo**: ${subtitle}
${formulaBlock}
${suggestionBlock}

## Configuração
${offerings ? `- O que a marca oferece: ${offerings}` : ''}
- Pilar: ${pilar}
- Plataforma: ${platformGuide}
- Formato: ${format} (${publicationFormat})
- Variante visual: ${variant}
- Tom: ${tone}
- Público: ${audience}
${preferred ? `- Vocabulário: ${preferred}` : ''}

## Tarefa
Gere EXATAMENTE ${slideCount} slides para este ${format}.

### Estrutura de cada slide
Cada slide tem 3 campos:
- **title**: frase de impacto (4-10 palavras). Use _underscore_ em UMA palavra-chave para destaque visual (vira itálico colorido no card, na cor de destaque da marca).
- **subtitle**: frase explicativa que aprofunda (5-15 palavras). Pode ser omitida em slides muito impactantes.
- **callout** (opcional): frase curta de destaque em negrito (2-6 palavras), tipo "A escolha é agora.", "E aí?", "Você vê isso?". Use com moderação — só quando reforça.

### Regras
1. Slide 1 (HERO): título potente + subtítulo + callout. Mostra a tese central da ideia.
2. Slides 2 a ${slideCount - 1}: cada um aprofunda um ponto. Variação entre estrutura "tese-explicação" e "pergunta-resposta".
3. Slide ${slideCount} (CTA): fechamento com callout que pede ação (salve, comente, compartilhe).
4. Use _underscores_ APENAS em palavras-chave do title, nunca no subtitle/callout.
5. Sem emojis nos slides.
6. Tom coerente com ${tone}.

### Legenda para ${plat === 'linkedin' ? 'LinkedIn' : plat === 'instagram' ? 'Instagram' : 'as plataformas'}:
- Abertura que prende (1-2 linhas)
- Desenvolvimento em blocos curtos
- Pergunta ou CTA no final
- 5-8 hashtags relevantes

Retorne APENAS JSON válido:
{
  "slides": [
    {"number": 1, "title": "...", "subtitle": "...", "callout": "..."},
    {"number": 2, "title": "...", "subtitle": "...", "callout": ""}
  ],
  "caption": "texto completo da legenda aqui"
}`
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    await new Promise(r => setTimeout(r, 2000))
    return NextResponse.json(DEMO_SLIDES)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    title, subtitle, pilar, platform, format, publicationFormat,
    variant, brand_dna, workspace_id, formula, suggestion, suggestion_mode,
    use_web_search,
  } = body

  if (!title || !workspace_id) {
    return NextResponse.json({ error: 'title e workspace_id são obrigatórios' }, { status: 400 })
  }

  // Limite de uso por workspace/plano
  const limit = await checkGenerationLimit(workspace_id)
  if (!limit.ok) {
    return NextResponse.json({
      error: `Limite mensal de ${limit.limit} gerações atingido no plano ${limit.plan}.`,
      hint: 'Aguarde o próximo ciclo ou faça upgrade do plano.',
      type: 'limit',
      usage: limit,
    }, { status: 402 })
  }

  const mode: SuggestionMode = (suggestion_mode as SuggestionMode) || 'hint'
  const isTrends = !!use_web_search && mode === 'news'
  const prompt = buildSlidesPrompt(title, subtitle, pilar, platform, format, publicationFormat, variant, formula, suggestion, mode, isTrends, brand_dna || {})

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: use_web_search ? 4500 : 2400,
      messages: [{ role: 'user', content: prompt }],
      ...(use_web_search && {
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
        }] as any,
      }),
    })

    // Extrai o último bloco de texto (depois de eventuais tool_use blocks)
    let raw = '{}'
    for (const block of message.content) {
      if (block.type === 'text') raw = block.text
    }
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { slides: [], caption: '' }

    // Backward compat: se vier só "text" antigo, transforma em title
    result.slides = (result.slides || []).map((s: any) => ({
      number: s.number,
      title: s.title || s.text || '',
      subtitle: s.subtitle || '',
      callout: s.callout || '',
    }))

    // Salvar no histórico
    await supabase.from('generated_content').insert({
      workspace_id,
      content: result.caption,
      prompt_used: `${title} — ${subtitle}`,
      model: 'claude-sonnet-4-6',
      platform,
      format,
      created_by: user.id,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[slides] generation error:', err?.status, err?.message)
    const friendly = mapAnthropicError(err)
    return NextResponse.json(
      { error: friendly.message, hint: friendly.hint, type: friendly.type },
      { status: friendly.status }
    )
  }
}
