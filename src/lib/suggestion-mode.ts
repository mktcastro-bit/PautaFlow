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
    // Detecta se é o sub-modo "trends" (prompt sintético criado pelo frontend)
    const isTrends = /Comente as tendências.+sobre/i.test(suggestion)

    if (isTrends) {
      return `## Conteúdo base — NOTÍCIA / atualidade (busca real-time)

${suggestion.trim()}

INSTRUÇÕES PARA A IA:
1. Use a ferramenta web_search para encontrar notícias RECENTES (últimos 30 dias quando possível)
2. Faça 1-2 buscas relevantes sobre o tema
3. Identifique 3-5 notícias/tendências DIFERENTES sobre o assunto
4. Para cada ideia, escolha UMA notícia/ângulo específico
5. As ideias devem REFERENCIAR a notícia (manchete, fonte, data) no subtítulo
6. NÃO invente notícias — use apenas o que encontrar nas buscas`
    }

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
    const isTrends = /Comente as tendências.+sobre/i.test(suggestion)

    if (isTrends) {
      return `## Modo NOTÍCIA · TENDÊNCIAS REAIS (web search)

${suggestion.trim()}

INSTRUÇÕES PARA OS SLIDES:
1. Use a ferramenta web_search para encontrar a notícia/tendência mais relevante e ATUAL
2. Faça 1-2 buscas focadas
3. Use os FATOS encontrados (manchete, fonte, data) — NÃO invente nada
4. ESTRUTURA dos slides:
   - Slide 1: gancho da notícia/tendência (manchete + impacto)
   - Slides intermediários: ângulo da marca sobre o fato, contexto, dados
   - Slide final: CTA + cite a fonte (nome do veículo, data)
5. Mantenha o tom da marca, mas seja factual no que veio da busca`
    }

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
