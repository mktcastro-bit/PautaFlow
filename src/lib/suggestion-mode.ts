/**
 * Modos de uso do campo "Conteúdo base" na geração.
 * Cada modo muda como a IA deve tratar o texto fornecido pelo usuário.
 */

export type SuggestionMode = 'hint' | 'news' | 'adapt' | 'literal'

/**
 * Bloco a ser inserido no prompt de geração de IDEIAS.
 */
export function buildSuggestionBlock(
  suggestion: string | undefined,
  mode: SuggestionMode,
  isTrends = false,
): string {
  if (!suggestion?.trim()) return ''

  if (mode === 'hint') {
    return `## Sugestão do usuário (use como inspiração leve)
${suggestion.trim()}`
  }

  if (mode === 'news') {
    if (isTrends) {
      return `## Conteúdo base — NOTÍCIA / atualidade (BUSCA REAL-TIME OBRIGATÓRIA)

Briefing do usuário:
${suggestion.trim()}

⚠️ INSTRUÇÕES CRÍTICAS:

1. **OBRIGATÓRIO:** ANTES de responder, faça PELO MENOS 1 busca usando a ferramenta web_search.
   Não responda sem fazer a busca primeiro.

2. **Queries sugeridas:** termos relacionados ao pilar do usuário + "notícia" / "novidade" /
   "tendência" / "recente" / mês corrente / ano corrente.

3. **Use os resultados:** identifique 3-5 notícias/manchetes DIFERENTES e RECENTES
   (últimos 30-60 dias quando possível).

4. **Para cada ideia gerada:**
   - O TÍTULO deve refletir a manchete da notícia encontrada (não inventar)
   - O SUBTÍTULO deve mencionar a FONTE (nome do veículo) e a DATA (mês/ano)
   - Exemplo de subtítulo: "Fonte: Folha de S.Paulo · Maio 2026"

5. **NUNCA invente notícias.** Se não encontrar nada relevante, retorne array vazio []
   em vez de fabricar.

6. As 5 ideias devem ser sobre 5 notícias diferentes (ou 5 ângulos do mesmo fato relevante).`
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
  isTrends = false,
): string {
  if (!suggestion?.trim() || mode === 'hint') {
    return ''  // sem conteúdo base, segue tarefa padrão
  }

  if (mode === 'news') {
    if (isTrends) {
      return `## Modo NOTÍCIA · BUSCA REAL-TIME (web search OBRIGATÓRIO)

Briefing do usuário:
${suggestion.trim()}

⚠️ INSTRUÇÕES CRÍTICAS:

1. **OBRIGATÓRIO:** ANTES de gerar os slides, faça PELO MENOS 1 busca usando web_search.
   Use queries que combinem o pilar do usuário + termos como "notícia recente",
   "tendência ${new Date().getFullYear()}", "lançamento", etc.

2. **Escolha 1 notícia/fato encontrado** que seja realmente relevante para o pilar e marca.

3. **ESTRUTURA dos slides (OBRIGATÓRIO):**
   - **Slide 1:** manchete adaptada da notícia (curta e impactante) + subtítulo que
     diz "Segundo [VEÍCULO], [DATA]" ou similar
   - **Slides 2 a ${slideCount - 1}:** desenvolvimento da notícia (dados, números, contexto)
     + ângulo da marca (o que isso significa para o público da marca)
   - **Slide ${slideCount}:** Callout com link/fonte + CTA (ex: "Fonte: [veículo] · [data]")

4. **NA LEGENDA:** OBRIGATORIAMENTE termine com:
   "📰 Fonte: [Nome do veículo] · [Data da publicação]"
   E se possível, o URL da matéria.

5. **NUNCA invente fatos, dados, declarações ou números.** Use APENAS o que encontrar
   na busca. Se a busca não trouxer informações concretas, peça desculpas no slide 1
   e retorne uma resposta indicando que não conseguiu encontrar notícia relevante.

6. **NÃO faça conteúdo genérico** "sobre o tema X" como se fosse um post comum.
   Este é um post REATIVO a uma notícia específica.`
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
