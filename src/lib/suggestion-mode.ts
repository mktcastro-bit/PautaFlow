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

1. **OBRIGATÓRIO:** Faça PELO MENOS 2 buscas usando web_search com termos diferentes
   (mais geral + mais específico) antes de escolher uma notícia.

2. **PRIORIZE FONTES JORNALÍSTICAS RECONHECIDAS** — em ordem de preferência:

   🇧🇷 **Brasil — imprensa jornalística:**
   Folha de S.Paulo, Estadão, O Globo, UOL Notícias, Valor Econômico,
   Exame, InfoMoney, Forbes Brasil, Neofeed, Olhar Digital, Tilt UOL,
   Canaltech, MIT Technology Review Brasil, Brazil Journal, Pipeline Valor.

   🇧🇷 **Marketing / Branding / Comunicação:**
   Meio & Mensagem, ProXXIma, B9, Adnews, PropMark, MKT Esportivo,
   Mercado e Consumo, NewTrade, Consumidor Moderno.

   🌍 **Internacional respeitada:**
   Harvard Business Review, MIT Sloan Review, Stratechery, TechCrunch,
   The Verge, Wired, FT, Bloomberg, Reuters, NYT, BBC, WSJ, Fast Company,
   Marketing Week, Adweek, Campaign, The Drum.

   ✅ **Outras aceitáveis se publicação tem editorial sério:**
   Site institucional de associações de classe (CONAR, ABERJE),
   relatórios de consultorias top (McKinsey, Deloitte, PwC, Accenture,
   Gartner, Forrester), papers acadêmicos com DOI.

3. **EVITE / RECUSE estas fontes:**

   ❌ Blogs pessoais auto-publicados (Medium genérico, Substack desconhecido)
   ❌ Sites de empresas falando de si mesmas (press releases disfarçados)
   ❌ Sites obscuros com domínios estranhos ou poucos conteúdos
   ❌ Sites que exigem cadastro/login para ler a notícia inteira
   ❌ Sites com paywall total (sem conteúdo público)
   ❌ Posts no LinkedIn (não são jornalismo)
   ❌ "thebrandingjournal.com" e similares (blogs corporativos pequenos)
   ❌ Agregadores ou sites com matérias copiadas

4. **VALIDAÇÕES — recuse e retorne vazio se:**
   - A busca não retornar nada substantivo em fontes de qualidade
   - Você precisar usar termos vagos como "esse fundador", "uma empresa"
   - A URL não estiver disponível nos resultados — NUNCA fabrique URLs
   - A fonte for um blog corporativo pequeno ou auto-publicado

5. **NUNCA generalize.** Se não conseguir nomear sujeitos e citar números/fatos
   a partir de uma fonte sólida, retorne { "ideas": [], "news": null }.

6. **NUNCA invente fontes/URLs.** Use APENAS domínios e links que apareceram
   nos resultados da busca, exatamente como apareceram.

7. **Escolha UMA notícia ALTAMENTE RECENTE** (OBRIGATÓRIO: últimos 60 dias.
   IDEAL: últimos 30 dias. Se só encontrar coisa de 3+ meses, retorne vazio) com:
   - Sujeito claro e NOMEÁVEL (pessoa, empresa, instituição)
   - Fatos concretos (datas, números, declarações)
   - URL real e ACESSÍVEL publicamente

## Estrutura da resposta

Retorne JSON com 2 campos:
{
  "news": {
    "headline": "manchete real e completa, exatamente como aparece",
    "source": "Nome do veículo (ex: Forbes Brasil, Folha de S.Paulo)",
    "date": "DD de mês de ano (ex: 14 de maio de 2026)",
    "url": "URL completa exatamente como veio da busca",
    "snippet": "trecho real de 150-250 chars com FATOS específicos: nomes, números, datas"
  },
  "ideas": [
    {"formula": "atalho", "title": "...", "subtitle": "Fonte: [veículo] · [data]"},
    ...
  ]
}

## TAREFA DAS 5 IDEIAS — APRESENTAR, NÃO OPINAR

O usuário NÃO quer um carrossel de opinião sobre a notícia. Ele quer APRESENTAR
a notícia (formato news card / repost informativo).

As 5 ideias devem ser **5 versões diferentes de MANCHETE PRA APRESENTAR a mesma notícia**:

  ✅ "Apple lança Vision Pro 2 com bateria 4x maior"     (foco no fato)
  ✅ "Vision Pro 2: bateria de 12h e novo chip M5"        (foco em números)
  ✅ "O que muda no Vision Pro 2 que a Apple anunciou hoje"  (foco em pergunta)
  ❌ "5 razões pra você comprar o Vision Pro 2"          (opinião)
  ❌ "Por que a Apple está perdendo terreno"             (interpretação)

Cada título cita o sujeito/fato SEM julgar. O subtítulo SEMPRE inclui
"Fonte: [veículo] · [data]". A formula serve só como estilo de manchete,
não como ângulo opinativo.`
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
      return `## Modo NOTÍCIA · APRESENTAR (não opinar)

Briefing do usuário (inclui dados da notícia validada):
${suggestion.trim()}

⚠️ FILOSOFIA DESTE MODO

O usuário NÃO quer um carrossel de opinião OU análise extensa. Quer um
**news card**: apresenta a notícia de forma clara, atrativa e concisa,
deixando a descrição completa pra legenda. A IA está aqui pra REPORTAR,
não pra interpretar.

⚠️ INSTRUÇÕES CRÍTICAS:

1. **A notícia já foi validada pelo usuário** — não busque de novo, use os
   dados do briefing (headline, fonte, URL, snippet).

2. **NOMEIE os sujeitos.** Se a notícia diz "Apple lançou X", escreva "Apple"
   — NUNCA "uma empresa", "essa marca", "alguém". Se a notícia não nomeia,
   você não pode generalizar.

3. **USE SÓ FATOS DA NOTÍCIA.** Datas, números, declarações textuais.
   NUNCA invente dados, projeções ou consequências que não estão no briefing.

4. **ESTRUTURA dos ${slideCount} slides (news card):**

   - **Slide 1 (MANCHETE):**
     · title: reescrita curta e impactante da manchete original (até 12 palavras),
       sem opinião. Use _palavra_ pra destacar 1 palavra-chave.
     · subtitle: "Segundo [veículo] · [data]"
     · callout: vazio

   ${slideCount > 2 ? `- **Slides 2 a ${slideCount - 1} (FATOS-CHAVE):**
     · 1 fato concreto por slide (número, citação, decisão específica)
     · title: o fato em 1 frase curta (até 12 palavras)
     · subtitle: contexto curto se houver; senão vazio
     · NÃO opine, NÃO infira, NÃO especule sobre impactos
` : ''}
   - **Slide ${slideCount} (CTA):**
     · title: chamada simples ("Salve pra acompanhar", "Comente o que acha")
     · subtitle: "Fonte completa na legenda"
     · callout: vazio

5. **NA LEGENDA — AQUI VAI A DESCRIÇÃO COMPLETA:**
   - Parágrafo 1: 2-3 frases descrevendo a notícia com os fatos centrais
     (quem, o quê, quando, onde) na voz da marca.
   - Parágrafo 2 (opcional): 1-2 frases de contexto se a notícia tiver
     dados secundários relevantes.
   - Última linha: "📰 Fonte: [Nome do veículo] · [Data] · [URL]"
   - SEM hashtags promocionais excessivas. 3-5 hashtags do tema, no fim.
   - SEM opinião extensa nem listas de "o que isso significa pra você".

6. **NUNCA invente fatos.** Se um dado não está no briefing, não escreva.

7. **NUNCA invente URLs.** Use SOMENTE a URL que veio no briefing.`
    }

    return `## Modo NOTÍCIA · APRESENTAR (não opinar)

O usuário colou esta notícia pra você APRESENTAR (não comentar/opinar):

"""
${suggestion.trim()}
"""

⚠️ FILOSOFIA: news card. Apresentar a notícia com clareza nos slides,
descrição completa na legenda. SEM ângulos de opinião, SEM listas de
"o que isso significa", SEM interpretação editorial.

ESTRUTURA dos ${slideCount} slides:
- **Slide 1 (MANCHETE):** reescrita curta da manchete (até 12 palavras) +
  subtítulo com fonte e data se houver no texto colado
${slideCount > 2 ? `- **Slides 2 a ${slideCount - 1}:** 1 FATO concreto por slide
  (número, citação, decisão). Sem opinar, sem inferir.
` : ''}- **Slide ${slideCount} (CTA):** chamada simples + "Fonte completa na legenda"

NA LEGENDA: descrição da notícia em 1-2 parágrafos (quem, o quê, quando,
onde — verbos no presente/passado, sem juízo de valor). Última linha cita
a fonte. 3-5 hashtags do tema, sem floreio.

USE SÓ FATOS do texto. NUNCA invente dados, fontes ou URLs.`
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
