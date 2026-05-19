import { BrandDNA } from '@/types'

/**
 * Estrutura do conteúdo extraído do site da marca.
 * Salvo em brand_dna.extracted_content (jsonb).
 */
export interface ExtractedBrandContent {
  source_url?: string
  extracted_at?: string
  offerings?: string
  cases?: string[]
  topics?: string[]
  vocabulary?: string[]
  tone_sample?: string
}

/**
 * Monta um bloco de texto pronto pra ser injetado em prompts de geração.
 * Esse bloco entrega à IA exemplos REAIS do que a marca já fez/disse —
 * solução direta pro problema de conteúdo genérico.
 *
 * Retorna string vazia se não houver conteúdo extraído (geração segue
 * normal sem esse contexto).
 */
export function buildExtractedContentBlock(dna: Partial<BrandDNA> | null | undefined): string {
  if (!dna) return ''
  const extracted = (dna as any).extracted_content as ExtractedBrandContent | null | undefined
  if (!extracted) return ''

  const lines: string[] = []

  if (extracted.offerings?.trim()) {
    lines.push(`**O que essa marca de fato oferece:**\n${extracted.offerings.trim()}`)
  }

  if (extracted.cases && extracted.cases.length > 0) {
    lines.push(`**Cases/projetos reais já realizados pela marca:**\n${extracted.cases.map((c, i) => `${i + 1}. ${c}`).join('\n')}`)
  }

  if (extracted.topics && extracted.topics.length > 0) {
    lines.push(`**Tópicos que a marca aborda no próprio site:**\n${extracted.topics.join(', ')}`)
  }

  if (extracted.vocabulary && extracted.vocabulary.length > 0) {
    lines.push(`**Vocabulário/jargão específico que essa marca usa:**\n${extracted.vocabulary.join(', ')}`)
  }

  if (extracted.tone_sample?.trim()) {
    lines.push(`**Amostra literal do tom da marca (trecho real do site):**\n"${extracted.tone_sample.trim()}"`)
  }

  if (lines.length === 0) return ''

  return `## Contexto REAL da marca (extraído do site${extracted.source_url ? ` ${extracted.source_url}` : ''})
Use estes exemplos como referência — não invente cases ou ofertas, prefira sempre os fatos abaixo:

${lines.join('\n\n')}
`
}
