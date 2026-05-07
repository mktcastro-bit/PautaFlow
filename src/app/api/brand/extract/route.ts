import { NextResponse } from 'next/server'

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

    return NextResponse.json({
      colors,
      fonts,
      typographyStyle,
      title,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Não foi possível acessar o site' },
      { status: 500 }
    )
  }
}
