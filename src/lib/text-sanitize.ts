/**
 * Sanitização de texto gerado pela IA antes de mostrar ao usuário.
 *
 * Problemas comuns que removemos:
 *  - Underscores SOLTOS (não-pareados) que aparecem literalmente no UI
 *    porque o renderer só converte pares `_palavra_` em destaque colorido.
 *    Ex: "Consistência_antes" → "Consistência antes"
 *
 *  - Hífens no início de linhas na legenda (markdown de bullet list
 *    aparece como traço literal no Instagram/LinkedIn).
 *    Ex: "- Publique com frequência" → "Publique com frequência"
 *
 *  - Asteriscos órfãos (markdown de bold que não veio em par).
 *
 *  - Excesso de quebras de linha consecutivas.
 */

/**
 * Substitui travessão (—, U+2014) e meia-risca (–, U+2013) por vírgula.
 * O hífen comum (-, U+002D) é preservado para palavras compostas.
 *
 * A IA tem tendência a inserir travessões em qualquer texto gerado
 * (hábito de copywriting em inglês), o que destoa da estética pedida
 * pelo cliente. Aplicamos a troca como rede de segurança caso o
 * prompt não seja respeitado.
 */
export function removeEmDashes(text: string): string {
  if (!text) return ''
  return text
    // Travessão/meia-risca com espaços ao redor → vírgula + espaço
    .replace(/\s*[—–]\s*/g, ', ')
    // Casos limítrofes: travessão sem espaço (raro mas possível)
    .replace(/[—–]/g, ',')
    // Colapsa vírgulas duplicadas que possam ter sido criadas
    .replace(/,\s*,/g, ',')
    // Remove vírgula órfã antes de pontuação final
    .replace(/,\s*([.!?;:])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
}

/**
 * Limpa underscores não-pareados de um texto curto (título/subtítulo/callout).
 * Mantém pares válidos `_palavra_` que viram destaque visual.
 */
export function cleanSlideText(text: string | undefined | null): string {
  if (!text) return ''
  let s = String(text)

  // 0) Remove travessões antes de qualquer outra limpeza
  s = removeEmDashes(s)

  // 1) Conta underscores. Se for número ímpar, há órfão → remover todos
  //    os que não estão em pares válidos.
  //    Estratégia: capturar todos os pares válidos primeiro, depois
  //    apagar os underscores restantes.
  const validPairs: Array<[number, number]> = []
  const regex = /_([^_\s][^_]*?[^_\s]|[^_\s])_/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(s)) !== null) {
    validPairs.push([m.index, m.index + m[0].length - 1])
  }

  // 2) Remove underscores que NÃO estão em posições de pares válidos
  const isInValidPair = (idx: number) =>
    validPairs.some(([start, end]) => idx === start || idx === end)

  s = s
    .split('')
    .map((ch, i) => (ch === '_' && !isInValidPair(i) ? ' ' : ch))
    .join('')

  // 3) Colapsa espaços duplos que possam ter sido criados
  s = s.replace(/[ \t]{2,}/g, ' ').trim()

  // 4) Remove asteriscos órfãos (markdown bold sem par)
  const asteriskCount = (s.match(/\*/g) || []).length
  if (asteriskCount % 2 !== 0) {
    s = s.replace(/\*/g, '')
  }

  return s
}

/**
 * Mantém no máximo `max` hashtags na legenda — o excedente é removido.
 * O Instagram passou a limitar a 5 hashtags por post, então qualquer
 * legenda gerada com mais é cortada automaticamente como rede de
 * segurança (caso o modelo ignore a instrução do prompt).
 */
export function limitHashtags(text: string, max = 5): string {
  let count = 0
  const trimmed = text.replace(/#[\p{L}\p{N}_]+/gu, (match) => {
    count++
    return count <= max ? match : ''
  })
  // Limpa espaços/linhas em branco deixados pelas hashtags removidas
  return trimmed
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
}

/**
 * Limpa uma legenda inteira (caption) — texto longo.
 *  - Remove hífens/bullets do início de linhas
 *  - Remove asteriscos órfãos
 *  - Normaliza quebras de linha excessivas
 *  - Remove underscores soltos (mesma lógica do slide)
 *  - Garante no máximo 5 hashtags (limite do Instagram)
 */
export function cleanCaption(text: string | undefined | null): string {
  if (!text) return ''
  let s = String(text)

  // 1) Remove bullets de markdown no início de cada linha:
  //    "- texto", "* texto", "• texto" → "texto"
  s = s.replace(/^[\s]*[-*•][\s]+/gm, '')

  // 2) Remove headers markdown "# ", "## " no início de linhas
  //    (NÃO confundir com hashtags — headers têm espaço depois do #)
  s = s.replace(/^#{1,6}\s+/gm, '')

  // 3) Aplica a mesma limpeza de underscores soltos do slide
  s = cleanSlideText(s)

  // 4) Normaliza 3+ quebras de linha consecutivas em 2
  s = s.replace(/\n{3,}/g, '\n\n')

  // 5) Limita hashtags a 5 (limite atual do Instagram)
  s = limitHashtags(s, 5)

  return s.trim()
}

/**
 * Sanitiza um objeto de slide inteiro (title, subtitle, callout).
 */
export function cleanSlide<T extends { title?: string; subtitle?: string; callout?: string; text?: string }>(
  slide: T
): T {
  return {
    ...slide,
    title: cleanSlideText(slide.title),
    subtitle: cleanSlideText(slide.subtitle),
    callout: cleanSlideText(slide.callout),
    text: cleanSlideText(slide.text),
  }
}
