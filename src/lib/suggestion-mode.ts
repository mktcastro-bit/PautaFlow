/**
 * Modos de uso do campo "Conteúdo base" na geração.
 * Cada modo muda como a IA deve tratar o texto fornecido pelo usuário.
 */

export type SuggestionMode = 'hint' | 'news' | 'adapt' | 'literal'

/**
 * Bloco a ser inserido no prompt de geração de IDEIAS.
 */
export function buildSuggestionBlock(suggestion: string | undefined, mode: SuggestionMode): string {
  if (!suggestion?.trim()) return ''

  if (mode === 'hint') {
    return `## Sugestão do usuário (use como inspiração leve)
${suggestion.trim()}`
  }

  if (mode === 'news') {
    return `## Conteúdo base — NOTÍCIA / atualidade
O usuário colou esta notícia para você comentar com a voz da marca:

"""
${suggestion.trim()}
"""

Ao gerar as ideias, cada uma deve trazer um ÂNGULO DIFERENTE sobre esta notícia,
sempre conectando ao pilar da marca. Cite a fonte quando relevante.`
  }

  if (mode === 'adapt') {
    return `## Conteúdo base — MATERIAL para adaptar
O usuário colou este texto para você extrair os pontos principais e reformular ao tom da marca:

"""
${suggestion.trim()}
"""

Ao gerar as ideias, cada uma deve representar um RECORTE/ÂNGULO DIFERENTE deste material,
mantendo a essência mas adaptado ao tom da marca.`
  }

  // literal — não passa por ideias (frontend trata), mas inclui aqui por completude
  return `## Conteúdo base — TEXTO LITERAL (preserve palavras)
${suggestion.trim()}`
}

/**
 * Bloco a ser inserido no prompt de geração de SLIDES.
 * Aqui o modo muda DRÁSTICAMENTE a tarefa.
 */
export function buildSlidesInstructions(
  suggestion: string | undefined,
  mode: SuggestionMode,
  slideCount: number,
): string {
  if (!suggestion?.trim() || mode === 'hint') {
    return ''  // sem conteúdo base, segue tarefa padrão
  }

  if (mode === 'news') {
    return `## Modo NOTÍCIA — comente esta atualidade com a voz da marca

O usuário colou esta notícia:

"""
${suggestion.trim()}
"""

ESTRUTURA recomendada para os slides:
- Slide 1: apresenta a notícia (gancho/manchete) com a marca dando o tom
- Slides intermediários: ângulo da marca sobre o fato — o que isso significa, contexto, dados,
  implicações para o público da marca
- Slide final: orientação prática + CTA + cite a fonte quando possível
Use FACTOS da notícia. Não invente dados.`
  }

  if (mode === 'adapt') {
    return `## Modo ADAPTAR — reformular este material no formato carrossel

O usuário colou este texto base:

"""
${suggestion.trim()}
"""

ESTRUTURA: extraia os ${slideCount - 1} pontos mais importantes do texto e estruture em slides.
Você pode reordenar, reformular e adaptar ao tom da marca, mantendo a essência das ideias.
Slide final: CTA da marca.`
  }

  if (mode === 'literal') {
    return `## Modo LITERAL — preserve as palavras do usuário

O usuário colou este texto exatamente como quer ver nos slides:

"""
${suggestion.trim()}
"""

REGRAS CRÍTICAS PARA O MODO LITERAL:
1. PRESERVE o texto na íntegra — não reescreva, não resuma, não reformule
2. Divida o texto em ${slideCount} slides respeitando a ordem original
3. Em cada slide, identifique 1 ou 2 palavras-chave e envolva com _underscore_ para destaque visual
4. Não adicione conteúdo novo, callouts inventados ou CTAs que não estejam no texto
5. Se o texto for curto, você pode dar mais espaço/respiração entre os slides
6. Subtítulos só se houver natural complemento no texto original
7. Para a LEGENDA, apenas reproduza o texto base completo (ou um resumo curto se for muito longo)`
  }

  return ''
}
