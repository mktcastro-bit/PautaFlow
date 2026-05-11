import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { BrandDNA } from '@/types'
import { getFormula } from '@/lib/viral-formulas'

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
  dna: Partial<BrandDNA>
): string {
  const tone = dna.step3_tone?.join(', ') || 'direto'
  const brand = dna.step1_brand_name || 'a marca'
  const audience = (dna as any).step2_target_audience || (dna as any).step2_roles?.join(', ') || 'empreendedores'
  const preferred = dna.step3_preferred_words?.join(', ') || ''

  const fmt = format.toLowerCase()
  const plat = platform.toLowerCase()

  const slideCount =
    fmt === 'carrossel' ? 8 :
    fmt === 'thread'    ? 10 :
    fmt === 'artigo'    ? 6 :
    1

  const platformGuide = plat === 'linkedin'
    ? 'LinkedIn — mais texto, mais profundidade, storytelling corporativo'
    : plat === 'instagram'
    ? 'Instagram — direto, visual, impacto em poucos segundos'
    : 'Instagram e LinkedIn — equilibre profundidade e impacto visual'

  // Bloco da fórmula viral (se selecionada)
  const formulaSpec = formula ? getFormula(formula) : null
  const formulaBlock = formulaSpec ? `

## Fórmula viral aplicada: ${formulaSpec.label} (${formulaSpec.shortName})
${formulaSpec.description}

Aplique essa estrutura ao desenvolver os slides. O slide 1 reflete o título com a abordagem desta fórmula.
Exemplo de aplicação: ${formulaSpec.example}` : ''

  return `Você é o copywriter de ${brand}.

## Ideia selecionada
- **Título**: ${title}
- **Subtítulo**: ${subtitle}
${formulaBlock}

## Configuração
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
- **title**: frase de impacto (4-10 palavras). Use _underscore_ em UMA palavra-chave para destaque visual (vira itálico dourado no card).
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
  const { title, subtitle, pilar, platform, format, publicationFormat, variant, brand_dna, workspace_id, formula } = body

  if (!title || !workspace_id) {
    return NextResponse.json({ error: 'title e workspace_id são obrigatórios' }, { status: 400 })
  }

  const prompt = buildSlidesPrompt(title, subtitle, pilar, platform, format, publicationFormat, variant, formula, brand_dna || {})

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2400,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
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
  } catch (err) {
    console.error('Slides generation error:', err)
    return NextResponse.json({ error: 'Erro ao gerar slides' }, { status: 500 })
  }
}
