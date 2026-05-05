import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { BrandDNA } from '@/types'

const DEMO_IDEAS = [
  {
    title: 'IA sem modelo de comportamento é automação de achismo',
    subtitle: 'Quando a tecnologia não parte do humano, ela apenas acelera decisões erradas.',
  },
  {
    title: 'Você comprou IA. Quem está treinando ela para o seu negócio?',
    subtitle: 'Ferramenta sem estratégia comportamental é custo disfarçado de inovação.',
  },
  {
    title: 'O problema não é adotar IA — é saber o que perguntar a ela',
    subtitle: 'A qualidade do output de IA depende diretamente da maturidade estratégica de quem a opera.',
  },
  {
    title: 'IA lê padrão. Humano lê contexto. Sua empresa sabe usar os dois?',
    subtitle: 'A vantagem competitiva real está na interseção entre dado comportamental e decisão estratégica.',
  },
  {
    title: 'Personalização em escala só funciona se você entende o que escalar',
    subtitle: 'Empresas usam IA para multiplicar mensagens sem entender o comportamento que as mensagens devem ativar.',
  },
  {
    title: 'Sua stack de IA está crescendo. Sua clareza estratégica, não.',
    subtitle: 'Mais ferramentas com menos direção criam complexidade operacional, não vantagem competitiva.',
  },
]

function buildIdeasPrompt(
  pilar: string,
  platform: string,
  format: string,
  suggestion: string | undefined,
  dna: Partial<BrandDNA>
): string {
  const tone = dna.step3_tone?.join(', ') || 'direto e estratégico'
  const audience = dna.step2_target_audience || 'empreendedores e gestores'
  const avoid = dna.step3_avoid_words?.join(', ') || ''
  const preferred = dna.step3_preferred_words?.join(', ') || ''
  const pillars = dna.step5_content_pillars?.join(', ') || pilar
  const brand = dna.step1_brand_name || 'a marca'
  const differentiator = dna.step5_differentiators || ''

  return `Você é o estrategista de conteúdo de ${brand}.

## Contexto da Marca
- Tom de voz: ${tone}
- Público: ${audience}
- Diferencial: ${differentiator}
- Pilares: ${pillars}
${avoid ? `- Evitar: ${avoid}` : ''}
${preferred ? `- Vocabulário preferido: ${preferred}` : ''}

## Briefing desta geração
- Pilar escolhido: ${pilar}
- Plataforma: ${platform}
- Formato: ${format}
${suggestion ? `- Sugestão do usuário: ${suggestion}` : ''}

## Tarefa
Gere exatamente 6 ideias de conteúdo provocativas, diretas e estratégicas para o pilar "${pilar}".

Cada ideia deve ter:
- **title**: título ousado e direto (máx 12 palavras) — deve gerar curiosidade ou provocar reflexão
- **subtitle**: frase complementar que aprofunda a ideia (máx 20 palavras)

Regras:
1. Seja provocativo, não genérico
2. Cada ideia deve ter um ângulo diferente
3. Use o vocabulário e tom da marca
4. Pense no formato ${format} para ${platform}

Retorne APENAS JSON válido, sem markdown, sem explicações:
[
  {"title": "...", "subtitle": "..."},
  {"title": "...", "subtitle": "..."},
  {"title": "...", "subtitle": "..."},
  {"title": "...", "subtitle": "..."},
  {"title": "...", "subtitle": "..."},
  {"title": "...", "subtitle": "..."}
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
      max_tokens: 1024,
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
