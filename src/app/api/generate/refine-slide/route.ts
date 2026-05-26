import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { mapAnthropicError } from '@/lib/anthropic/errors'
import { withRetry } from '@/lib/anthropic/retry'
import { cleanSlide } from '@/lib/text-sanitize'
import { BrandDNA } from '@/types'

/**
 * Refina UM slide específico com base em uma instrução em linguagem natural
 * vinda do usuário (ex: "deixa mais curto", "muda o tom pra mais provocador").
 *
 * Não regenera o deck todo — só substitui aquele slide. Mantém posição,
 * número e papel narrativo do slide dentro da apresentação.
 */

interface SlideInput {
  number: number
  title?: string
  subtitle?: string
  callout?: string
  text?: string
}

interface DeckContext {
  slides: SlideInput[]
  ideaTitle?: string
  ideaSubtitle?: string
}

function buildRefinePrompt(
  slide: SlideInput,
  instruction: string,
  deck: DeckContext,
  dna: Partial<BrandDNA>
): string {
  const tone = dna.step3_tone?.join(', ') || 'direto e estratégico'
  const brand = dna.step1_brand_name || 'a marca'
  const audience = (dna as any).step2_target_audience || 'público da marca'
  const avoid = dna.step3_avoid_words?.join(', ') || ''
  const preferred = dna.step3_preferred_words?.join(', ') || ''

  const slideTitle = slide.title || slide.text || ''
  const totalSlides = deck.slides.length

  // Contexto: mostrar os 2 slides vizinhos pra IA manter coerência
  const neighbors = deck.slides
    .filter(s => Math.abs(s.number - slide.number) === 1)
    .map(s => `  Slide ${s.number}: "${s.title || s.text || ''}"${s.subtitle ? ` — ${s.subtitle}` : ''}`)
    .join('\n')

  return `Você é o estrategista de conteúdo de ${brand}.

## Contexto da marca
- Tom de voz: ${tone}
- Público: ${audience}
${avoid ? `- Evitar: ${avoid}` : ''}
${preferred ? `- Vocabulário preferido: ${preferred}` : ''}

## Contexto do carrossel
${deck.ideaTitle ? `- Ideia central: "${deck.ideaTitle}"` : ''}
${deck.ideaSubtitle ? `- Subtítulo: "${deck.ideaSubtitle}"` : ''}
- Total de slides: ${totalSlides}
- Você vai refinar o slide ${slide.number} de ${totalSlides}.

${neighbors ? `## Slides vizinhos (mantenha coerência narrativa)\n${neighbors}\n` : ''}

## Slide atual (será substituído)
- Título: "${slideTitle}"
${slide.subtitle ? `- Subtítulo: "${slide.subtitle}"` : ''}
${slide.callout ? `- Callout: "${slide.callout}"` : ''}

## Instrução do usuário
"${instruction.trim()}"

## Tarefa
Refine o slide acima seguindo a instrução, MAS:
1. Mantenha o papel narrativo dele dentro do carrossel
2. Mantenha o tom de voz da marca
3. Não invente fatos novos — só reescreva/ajuste o que já existe
4. Subtítulo é opcional (string vazia se não fizer sentido)
5. Callout é opcional (string vazia se não fizer sentido)
6. Título: até 14 palavras. Subtítulo: até 18 palavras. Callout: até 8 palavras.

## REGRAS CRÍTICAS DE FORMATAÇÃO (não pode quebrar)
⚠️ **Underscores APENAS no título**:
- Use em PARES envolvendo UMA ÚNICA palavra-chave: \`_consistência_\` ✅
- NUNCA use underscore como conector: \`Consistência_antes\` ❌
- NUNCA underscore solto, ímpar ou em meio de palavra
- NUNCA underscore no subtitle ou callout
- Máximo 1 par de underscores no title (pode não usar nenhum)

⚠️ **NÃO use markdown**: nem \`#\`, nem \`-\`, nem \`*\`, nem \`**bold**\` em nenhum campo.

⚠️ **Travessões PROIBIDOS**: nunca use \`—\` (travessão) nem \`–\` (meia-risca) em title, subtitle ou callout. Use vírgula, ponto ou parênteses. Hífen comum (\`-\`) em palavras compostas como "auto-estima" continua permitido.

Retorne APENAS JSON válido, sem markdown:
{"title": "...", "subtitle": "...", "callout": "..."}`
}

function extractSlideJson(raw: string): { title?: string; subtitle?: string; callout?: string } | null {
  if (!raw?.trim()) return null

  // 1) Bloco ```json {...} ```
  const fenceMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (fenceMatch) {
    try {
      const obj = JSON.parse(fenceMatch[1])
      if (obj && typeof obj === 'object') return obj
    } catch {}
  }

  // 2) Greedy — primeiro { até último }
  const greedy = raw.match(/\{[\s\S]*\}/)
  if (greedy) {
    try {
      const obj = JSON.parse(greedy[0])
      if (obj && typeof obj === 'object') return obj
    } catch {}
  }

  return null
}

export async function POST(req: NextRequest) {
  // Demo mode: retorna o mesmo slide com prefixo "(refinado)" pra dar feedback visual
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const body = await req.json().catch(() => ({}))
    await new Promise(r => setTimeout(r, 1200))
    return NextResponse.json({
      slide: {
        title: `(refinado) ${body.slide?.title || body.slide?.text || 'Slide'}`,
        subtitle: body.slide?.subtitle || '',
        callout: body.slide?.callout || '',
      },
    })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    workspace_id,
    slide,
    instruction,
    deck_context,
    brand_dna,
  }: {
    workspace_id?: string
    slide?: SlideInput
    instruction?: string
    deck_context?: DeckContext
    brand_dna?: Partial<BrandDNA>
  } = body

  if (!workspace_id || !slide || !instruction?.trim()) {
    return NextResponse.json(
      { error: 'workspace_id, slide e instruction são obrigatórios' },
      { status: 400 }
    )
  }

  const prompt = buildRefinePrompt(
    slide,
    instruction,
    deck_context || { slides: [slide] },
    brand_dna || {}
  )

  try {
    const message = await withRetry(() => anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }))

    let raw = ''
    for (const block of message.content) {
      if (block.type === 'text') raw += '\n' + block.text
    }

    const parsed = extractSlideJson(raw)
    if (!parsed || !parsed.title) {
      console.error('[refine-slide] could not parse response. Raw:', raw.slice(0, 500))
      return NextResponse.json(
        { error: 'Não consegui interpretar a resposta da IA. Tente reformular a instrução.' },
        { status: 502 }
      )
    }

    // Garante shape consistente — preserva number do slide original.
    // Sanitiza pra remover underscores soltos / markdown leak antes de devolver.
    const cleaned = cleanSlide({
      title: parsed.title,
      subtitle: parsed.subtitle ?? '',
      callout: parsed.callout ?? '',
    })

    // Registra geração no histórico para tracking de tokens no painel admin.
    // Falha silenciosa: não bloqueia a resposta se o insert falhar.
    const tokensUsed = (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0)
    supabase.from('generated_content').insert({
      workspace_id,
      content: `[refine] slide ${slide.number}: ${cleaned.title}`,
      prompt_used: `refine · "${instruction.slice(0, 80)}"`,
      model: 'claude-sonnet-4-6',
      platform: null,
      format: null,
      tokens_used: tokensUsed,
      created_by: user.id,
    }).then(({ error }) => {
      if (error) console.error('[refine-slide] generated_content insert error:', error.message)
    })

    return NextResponse.json({
      slide: {
        number: slide.number,
        title: cleaned.title,
        subtitle: cleaned.subtitle,
        callout: cleaned.callout,
      },
    })
  } catch (err: any) {
    console.error('[refine-slide] error:', err?.status, err?.message)
    const friendly = mapAnthropicError(err)
    return NextResponse.json(
      { error: friendly.message, hint: friendly.hint, type: friendly.type },
      { status: friendly.status }
    )
  }
}
