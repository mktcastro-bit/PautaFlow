import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { BrandDNA } from '@/types'

const DEMO_SLIDES = {
  slides: [
    { number: 1, text: 'IA sem modelo de\n_comportamento_\né automação de achismo' },
    { number: 2, text: 'A maioria das empresas adotou IA para _escalar_ — sem saber o que estava escalando.' },
    { number: 3, text: 'Como a maioria usa IA — e como _deveria_ usar' },
    { number: 4, text: '4 sinais de que sua IA está _automatizando achismo_' },
    { number: 5, text: 'O que precisa existir _antes_ da IA' },
    { number: 6, text: '_Dado comportamental_ + Decisão estratégica = Vantagem real' },
    { number: 7, text: '_Comportamento humano_ é o modelo. A IA é o motor. Nessa ordem, sempre.' },
    { number: 8, text: 'Antes de _escalar_, entenda o que está escalando.' },
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
  dna: Partial<BrandDNA>
): string {
  const tone = dna.step3_tone?.join(', ') || 'direto'
  const brand = dna.step1_brand_name || 'a marca'
  const audience = dna.step2_target_audience || 'empreendedores'
  const preferred = dna.step3_preferred_words?.join(', ') || ''

  const slideCount = format === 'carrossel' ? 8 : format === 'thread' ? 10 : 1

  const platformGuide = platform === 'linkedin'
    ? 'LinkedIn — mais texto, mais profundidade, storytelling corporativo'
    : platform === 'instagram'
    ? 'Instagram — direto, visual, impacto em poucos segundos'
    : 'Instagram e LinkedIn — equilibre profundidade e impacto visual'

  return `Você é o copywriter de ${brand}.

## Ideia selecionada
- **Título**: ${title}
- **Subtítulo**: ${subtitle}

## Configuração
- Pilar: ${pilar}
- Plataforma: ${platformGuide}
- Formato: ${format} (${publicationFormat})
- Variante visual: ${variant}
- Tom: ${tone}
- Público: ${audience}
${preferred ? `- Vocabulário: ${preferred}` : ''}

## Tarefa
Gere os textos de ${slideCount} slides para este ${format}.

### Regras para os slides:
1. Use _underscores_ em volta de palavras-chave para dar ênfase visual
2. Slide 1: título de impacto (pode ser o título da ideia, reformulado)
3. Slides 2-${slideCount - 1}: desenvolva a ideia com progressão lógica
4. Slide ${slideCount}: CTA ou fechamento poderoso
5. Cada slide deve ser curto — máx 15 palavras
6. Pense nos slides como cartões visuais independentes

### Legenda para ${platform === 'linkedin' ? 'LinkedIn' : platform === 'instagram' ? 'Instagram' : 'as plataformas'}:
- Abertura que prende (1-2 linhas)
- Desenvolvimento em blocos curtos
- Pergunta ou CTA no final
- Hashtags relevantes (5-8)

Retorne APENAS JSON válido:
{
  "slides": [
    {"number": 1, "text": "..."},
    {"number": 2, "text": "..."}
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
  const { title, subtitle, pilar, platform, format, publicationFormat, variant, brand_dna, workspace_id } = body

  if (!title || !workspace_id) {
    return NextResponse.json({ error: 'title e workspace_id são obrigatórios' }, { status: 400 })
  }

  const prompt = buildSlidesPrompt(title, subtitle, pilar, platform, format, publicationFormat, variant, brand_dna || {})

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { slides: [], caption: '' }

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
