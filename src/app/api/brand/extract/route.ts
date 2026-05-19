import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { withRetry } from '@/lib/anthropic/retry'

const SYSTEM_FONTS = new Set([
  'arial', 'helvetica', 'times', 'times new roman', 'georgia', 'verdana',
  'trebuchet ms', 'courier', 'courier new', 'palatino', 'garamond',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'oxygen',
  'ubuntu', 'cantarell', 'fira sans', 'droid sans', 'open sans',
  'helvetica neue', 'inherit', 'initial', 'unset',
])

function extractColors(css: string): string[] {
  const found = new Set<string>()

  // hex 3 ou 6 dígitos
  const hexMatches = css.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || []
  for (const hex of hexMatches) {
    const normalized = hex.toLowerCase()
    // ignora branco puro, preto puro e cinzas neutros
    if (['#fff', '#ffffff', '#000', '#000000'].includes(normalized)) continue
    const expanded = normalized.length === 4
      ? '#' + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3]
      : normalized
    const r = parseInt(expanded.slice(1, 3), 16)
    const g = parseInt(expanded.slice(3, 5), 16)
    const b = parseInt(expanded.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    const saturation = Math.max(r, g, b) - Math.min(r, g, b)
    // só inclui cores com alguma saturação e não muito claras/escuras
    if (saturation > 20 && brightness > 30 && brightness < 240) {
      found.add(expanded)
    }
  }

  return Array.from(found).slice(0, 6)
}

function extractFonts(css: string): string[] {
  const found = new Set<string>()
  const matches = css.match(/font-family\s*:\s*([^;}{]+)/gi) || []

  for (const match of matches) {
    const value = match.replace(/font-family\s*:\s*/i, '')
    const families = value.split(',').map(f =>
      f.trim().replace(/['"]/g, '').toLowerCase()
    )
    for (const family of families) {
      const clean = family.split(' ').slice(0, 3).join(' ').trim()
      if (clean && !SYSTEM_FONTS.has(clean) && clean.length > 2 && clean.length < 40) {
        // capitaliza primeira letra de cada palavra
        found.add(clean.replace(/\b\w/g, c => c.toUpperCase()))
      }
    }
  }

  return Array.from(found).slice(0, 4)
}

function guessTypographyStyle(fonts: string[], css: string): string {
  const combined = (fonts.join(' ') + ' ' + css).toLowerCase()

  if (/playfair|merriweather|lora|garamond|eb garamond|cormorant|libre baskerville/.test(combined)) {
    return 'classico-elegante'
  }
  if (/bebas|oswald|black|ultra|heavy|black|extrabold|900/.test(combined)) {
    return 'bold-impactante'
  }
  if (/pacifico|dancing|caveat|lobster|comic|handwriting|cursive/.test(combined)) {
    return 'playful-descontraido'
  }
  if (/mono|code|ibm plex|source code|jetbrains|fira code/.test(combined)) {
    return 'tecnico-corporativo'
  }
  return 'moderno-minimalista'
}

// ─── Extração de TEXTO útil do HTML ────────────────────────────────────────

/**
 * Limpa HTML mantendo só conteúdo textual relevante.
 * Remove script/style/nav/footer e colapsa whitespace.
 * Limita o resultado para não estourar tokens da IA.
 */
function extractCleanText(html: string, maxChars = 8000): string {
  let s = html

  // Remove scripts e styles inteiros
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')

  // Remove navs e footers (geralmente lixo de menu)
  s = s.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
  s = s.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, ' ')

  // Remove comentários HTML
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')

  // Tags como espaço
  s = s.replace(/<[^>]+>/g, ' ')

  // Decode HTML entities básicos
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')

  // Colapsa whitespace
  s = s.replace(/\s+/g, ' ').trim()

  if (s.length > maxChars) s = s.slice(0, maxChars) + ' [...]'
  return s
}

/**
 * Usa Claude pra extrair conteúdo estruturado do texto do site.
 * Retorna null se falhar (não bloqueia a extração visual).
 */
async function extractBrandContent(
  cleanText: string,
  sourceUrl: string
): Promise<{
  offerings?: string
  cases?: string[]
  topics?: string[]
  vocabulary?: string[]
  tone_sample?: string
} | null> {
  if (!cleanText || cleanText.length < 100) return null

  const prompt = `Você analisa o conteúdo do site de uma marca e extrai informações estruturadas pra alimentar um sistema de geração de conteúdo de marketing.

## Texto do site (${sourceUrl})
"""
${cleanText}
"""

## Tarefa
Extraia DA FORMA MAIS LITERAL POSSÍVEL (não interprete, não generalize):

1. **offerings** (string, 1-3 frases): o que a marca oferece concretamente — produtos, serviços, soluções. Use as palavras da própria marca quando possível.

2. **cases** (array de 0-4 strings, cada uma de 1-3 frases): exemplos concretos de cases, clientes, projetos, resultados ou estudos mencionados. Cite NOMES e NÚMEROS quando aparecerem. Se o site não tiver cases, retorne [].

3. **topics** (array de 3-8 strings curtas): tópicos/temas que a marca aborda. Use vocabulário que apareceu no site.

4. **vocabulary** (array de 4-10 strings): jargão, termos técnicos ou palavras-marca específicas que essa marca usa (ex: "growth", "operação de marca", "DNA estratégico"). Não inclua palavras genéricas.

5. **tone_sample** (string, 1 parágrafo): copie LITERALMENTE 2-4 frases consecutivas do site que melhor representam o tom de voz da marca. Sem alterações.

## REGRAS CRÍTICAS
- NÃO invente nada que não esteja no texto
- Se um campo não tiver informação suficiente, retorne string vazia ou array vazio
- Use português do Brasil

Retorne APENAS JSON válido (sem markdown, sem comentários):
{
  "offerings": "...",
  "cases": ["...", "..."],
  "topics": ["...", "..."],
  "vocabulary": ["...", "..."],
  "tone_sample": "..."
}`

  try {
    const message = await withRetry(() => anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }))

    let raw = ''
    for (const block of message.content) {
      if (block.type === 'text') raw += '\n' + block.text
    }

    // Tenta extrair JSON
    const fenceMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (fenceMatch) {
      try { return JSON.parse(fenceMatch[1]) } catch {}
    }
    const greedy = raw.match(/\{[\s\S]*\}/)
    if (greedy) {
      try { return JSON.parse(greedy[0]) } catch {}
    }
    return null
  } catch (err) {
    console.error('[brand-extract] content extraction failed:', err)
    return null
  }
}

async function fetchCSS(url: string, base: string): Promise<string> {
  try {
    const absolute = url.startsWith('http') ? url : new URL(url, base).toString()
    const res = await fetch(absolute, { signal: AbortSignal.timeout(4000) })
    if (res.ok) return await res.text()
  } catch {}
  return ''
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const normalized = url.startsWith('http') ? url : `https://${url}`

    const res = await fetch(normalized, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PautaFlow/1.0)' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Site retornou ${res.status}` }, { status: 400 })
    }

    const html = await res.text()

    // Coleta CSS inline
    const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
      .map(m => m[1]).join('\n')

    // Coleta links de CSS externos (máx 3 para não demorar)
    const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi)]
      .map(m => m[1]).slice(0, 3)

    const externalCSS = (await Promise.all(cssLinks.map(href => fetchCSS(href, normalized)))).join('\n')

    const allCSS = styleBlocks + '\n' + externalCSS

    const colors = extractColors(allCSS)
    const fonts = extractFonts(allCSS)
    const typographyStyle = guessTypographyStyle(fonts, allCSS)

    // Tenta capturar title e meta description para referência
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // ─── Extração de CONTEÚDO via IA (ofertas, cases, tópicos, etc) ───
    // Roda em paralelo ao retorno visual; se falhar, devolve null e o
    // wizard segue sem isso (não bloqueia o setup do DNA).
    const cleanText = extractCleanText(html)
    const extractedContent = await extractBrandContent(cleanText, normalized)

    return NextResponse.json({
      colors,
      fonts,
      typographyStyle,
      title,
      // Conteúdo estruturado pra alimentar gerações futuras
      content: extractedContent ? {
        source_url: normalized,
        extracted_at: new Date().toISOString(),
        ...extractedContent,
      } : null,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Não foi possível acessar o site' },
      { status: 500 }
    )
  }
}
