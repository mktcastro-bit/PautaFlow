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

7. **Escolha UMA notícia específica e recente** (últimos 30-60 dias quando possível) com:
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

As 5 ideias devem ser 5 ÂNGULOS DIFERENTES sobre essa MESMA notícia.
Cada título precisa citar/referenciar o sujeito específico da notícia.`
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
      return `## Modo NOTÍCIA · BUSCA REAL-TIME (notícia já validada pelo usuário)

Briefing do usuário (inclui dados da notícia escolhida):
${suggestion.trim()}

⚠️ INSTRUÇÕES CRÍTICAS:

1. **A notícia JÁ FOI ENCONTRADA e validada pelo usuário** — você não precisa buscar de novo.
   Use os dados (headline, fonte, URL, snippet) que estão no briefing acima.

2. **NOMEIE explicitamente os sujeitos da notícia.**
   Se a notícia menciona "Pedro Silva, fundador da TechX", você DEVE escrever
   "Pedro Silva" ou "fundador da TechX" — NUNCA "esse fundador", "uma pessoa",
   "alguém", "uma empresa". O leitor precisa entender DE QUEM/DO QUÊ se trata.

3. **USE FATOS CONCRETOS:** datas, números, declarações textuais, decisões específicas.
   Se a notícia diz "TechX cresceu 300% em 2025", escreva "TechX cresceu 300%" —
   não "uma empresa cresceu muito".

4. **ESTRUTURA dos slides (OBRIGATÓRIO):**
   - **Slide 1:** Manchete impactante mencionando o SUJEITO + subtítulo
     "Segundo [veículo], [data]"
   - **Slides 2 a ${slideCount - 1}:** Dados concretos da notícia + ângulo da marca
     (use nomes, números, citações; NUNCA generalize)
   - **Slide ${slideCount}:** CTA + cite a fonte completa

5. **NA LEGENDA:** Comece com o sujeito específico ("Pedro Silva mostrou que..."),
   inclua os fatos centrais, e termine com:
   "📰 Fonte: [Nome do veículo] · [Data]"
   Se houver URL na notícia, inclua: [veiculo.com.br/...]

6. **NUNCA invente fatos, dados, declarações ou números além do que está no briefing.**

7. **NUNCA use frases vagas como:** "esse fundador", "uma empresa", "alguém fez",
   "uma marca", "esse executivo". Se a notícia não nomeia, você não pode generalizar.

8. **NUNCA invente URLs.** Use SOMENTE a URL que veio no briefing.`
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
