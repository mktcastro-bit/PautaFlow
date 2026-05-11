import Anthropic from '@anthropic-ai/sdk'
import { BrandDNA, PautaFormat } from '@/types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface GenerateContentParams {
  pauta_title: string
  pauta_description?: string
  platform: string
  format: PautaFormat
  brand_dna?: Partial<BrandDNA>
  custom_instructions?: string
}

export function buildSystemPrompt(brandDna?: Partial<BrandDNA>): string {
  if (!brandDna || !brandDna.completed) {
    return `Você é um especialista em marketing de conteúdo e copywriting.
Crie conteúdo envolvente, autêntico e otimizado para a plataforma especificada.
Use linguagem clara, objetiva e que gere engajamento.`
  }

  const tone = brandDna.step3_tone?.join(', ') || 'profissional'
  const pillars = brandDna.step5_content_pillars?.join(', ') || ''
  const avoid = brandDna.step3_avoid_words?.join(', ') || ''
  const preferred = brandDna.step3_preferred_words?.join(', ') || ''

  const offerings = (brandDna as any).step1_offerings || ''
  return `Você é o copywriter oficial da marca "${brandDna.step1_brand_name || 'nossa marca'}".

## Identidade da Marca
${offerings ? `- **Produtos/Serviços**: ${offerings}` : ''}
- **Missão**: ${brandDna.step1_mission || 'não definida'}
- **Valores**: ${brandDna.step1_values?.join(', ') || 'não definidos'}

## Público-Alvo
- **Persona**: ${brandDna.step2_persona_name || 'não definida'}
- **Descrição**: ${brandDna.step2_target_audience || 'não definido'}
- **Dores**: ${brandDna.step2_pain_points?.join(', ') || 'não definidas'}

## Tom de Voz
- **Tom**: ${tone}
- **Traços de personalidade**: ${brandDna.step3_personality_traits?.join(', ') || 'não definidos'}
${avoid ? `- **Evitar**: ${avoid}` : ''}
${preferred ? `- **Usar**: ${preferred}` : ''}

## Posicionamento
- **Diferencial**: ${brandDna.step5_differentiators || 'não definido'}
- **Pilares de conteúdo**: ${pillars}

## Regras
1. Mantenha SEMPRE o tom de voz definido
2. Nunca use palavras da lista de evitar
3. Foque nas dores e interesses do público-alvo
4. Seja autêntico ao posicionamento da marca`
}

export function buildUserPrompt(params: GenerateContentParams): string {
  const platformGuides: Record<string, string> = {
    instagram: 'Crie para Instagram. Use emojis estrategicamente, hashtags relevantes (5-10), call-to-action claro. Máx 2200 caracteres.',
    linkedin: 'Crie para LinkedIn. Tom mais profissional, storytelling, insights de valor. Sem excesso de hashtags (3-5). Pode ser mais longo.',
    twitter: 'Crie para Twitter/X. Máx 280 caracteres por tweet. Se thread, crie 5-8 tweets numerados.',
    facebook: 'Crie para Facebook. Conteúdo conversacional, pode ser mais longo, incentive comentários.',
    tiktok: 'Crie roteiro para TikTok. Hook nos primeiros 3 segundos, ritmo dinâmico, CTA forte no final.',
    youtube: 'Crie roteiro/descrição para YouTube. Hook inicial, estrutura clara, SEO no título e descrição.',
  }

  const formatGuides: Record<string, string> = {
    post: 'Crie um post único e completo.',
    carrossel: 'Crie um carrossel com 6-10 slides. Formato: [Slide 1: Título/Hook] [Slide N: Conteúdo] [Último slide: CTA]',
    stories: 'Crie 3-5 stories sequenciais com textos curtos e impactantes.',
    reels: 'Crie um roteiro para Reels com hook, desenvolvimento e CTA. Duração: 30-60 segundos.',
    artigo: 'Crie um artigo completo com introdução, desenvolvimento e conclusão.',
    thread: 'Crie uma thread com 8-12 tweets conectados e numerados.',
    newsletter: 'Crie uma newsletter com assunto, abertura, corpo e CTA final.',
  }

  return `## Pauta
**Título**: ${params.pauta_title}
${params.pauta_description ? `**Descrição/Contexto**: ${params.pauta_description}` : ''}

## Plataforma
${platformGuides[params.platform] || `Plataforma: ${params.platform}`}

## Formato
${formatGuides[params.format] || `Formato: ${params.format}`}

${params.custom_instructions ? `## Instruções Adicionais\n${params.custom_instructions}` : ''}

Crie o conteúdo agora, pronto para publicação.`
}

export async function generateContent(params: GenerateContentParams, brandDna?: Partial<BrandDNA>) {
  const systemPrompt = buildSystemPrompt(brandDna)
  const userPrompt = buildUserPrompt(params)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

  return { content, tokensUsed, promptUsed: userPrompt }
}
