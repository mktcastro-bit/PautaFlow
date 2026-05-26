// Catálogo curado de fontes para autocomplete no DNA da marca.
// Combina fontes populares do Google Fonts com fontes comuns do
// sistema operacional. As fontes do sistema permitem que o usuário
// digite nomes como "Times New Roman", "Arial" etc. sem que sejam
// rejeitadas pelo check da API do Google Fonts (que não as tem).

export type FontSource = 'google' | 'system'
export type FontCategory = 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'

export interface FontEntry {
  name: string
  source: FontSource
  category: FontCategory
}

export const FONT_CATALOG: FontEntry[] = [
  // ── Sans-Serif (Google) ──
  { name: 'Inter',               source: 'google', category: 'sans-serif' },
  { name: 'Roboto',              source: 'google', category: 'sans-serif' },
  { name: 'Open Sans',           source: 'google', category: 'sans-serif' },
  { name: 'Lato',                source: 'google', category: 'sans-serif' },
  { name: 'Montserrat',          source: 'google', category: 'sans-serif' },
  { name: 'Poppins',             source: 'google', category: 'sans-serif' },
  { name: 'Raleway',             source: 'google', category: 'sans-serif' },
  { name: 'Nunito',              source: 'google', category: 'sans-serif' },
  { name: 'Nunito Sans',         source: 'google', category: 'sans-serif' },
  { name: 'Source Sans 3',       source: 'google', category: 'sans-serif' },
  { name: 'PT Sans',             source: 'google', category: 'sans-serif' },
  { name: 'Ubuntu',              source: 'google', category: 'sans-serif' },
  { name: 'Work Sans',           source: 'google', category: 'sans-serif' },
  { name: 'Fira Sans',           source: 'google', category: 'sans-serif' },
  { name: 'Karla',               source: 'google', category: 'sans-serif' },
  { name: 'Hind',                source: 'google', category: 'sans-serif' },
  { name: 'Mulish',              source: 'google', category: 'sans-serif' },
  { name: 'Catamaran',           source: 'google', category: 'sans-serif' },
  { name: 'Cabin',               source: 'google', category: 'sans-serif' },
  { name: 'Heebo',               source: 'google', category: 'sans-serif' },
  { name: 'Titillium Web',       source: 'google', category: 'sans-serif' },
  { name: 'Varela Round',        source: 'google', category: 'sans-serif' },
  { name: 'DM Sans',             source: 'google', category: 'sans-serif' },
  { name: 'Plus Jakarta Sans',   source: 'google', category: 'sans-serif' },
  { name: 'Manrope',             source: 'google', category: 'sans-serif' },
  { name: 'Sora',                source: 'google', category: 'sans-serif' },
  { name: 'Space Grotesk',       source: 'google', category: 'sans-serif' },
  { name: 'Outfit',              source: 'google', category: 'sans-serif' },
  { name: 'Geist',               source: 'google', category: 'sans-serif' },
  { name: 'Bricolage Grotesque', source: 'google', category: 'sans-serif' },
  { name: 'Onest',               source: 'google', category: 'sans-serif' },
  { name: 'Archivo',             source: 'google', category: 'sans-serif' },
  { name: 'Archivo Narrow',      source: 'google', category: 'sans-serif' },
  { name: 'Archivo Black',       source: 'google', category: 'sans-serif' },
  { name: 'Maven Pro',           source: 'google', category: 'sans-serif' },
  { name: 'Asap',                source: 'google', category: 'sans-serif' },
  { name: 'Asap Condensed',      source: 'google', category: 'sans-serif' },
  { name: 'Quicksand',           source: 'google', category: 'sans-serif' },
  { name: 'Josefin Sans',        source: 'google', category: 'sans-serif' },
  { name: 'Comfortaa',           source: 'google', category: 'sans-serif' },
  { name: 'Roboto Condensed',    source: 'google', category: 'sans-serif' },
  { name: 'Oswald',              source: 'google', category: 'sans-serif' },
  { name: 'Anton',               source: 'google', category: 'sans-serif' },
  { name: 'Bebas Neue',          source: 'google', category: 'sans-serif' },
  { name: 'Fjalla One',          source: 'google', category: 'sans-serif' },
  { name: 'Squada One',          source: 'google', category: 'sans-serif' },
  { name: 'Saira',               source: 'google', category: 'sans-serif' },
  { name: 'Saira Condensed',     source: 'google', category: 'sans-serif' },
  { name: 'Yanone Kaffeesatz',   source: 'google', category: 'sans-serif' },
  { name: 'Exo 2',               source: 'google', category: 'sans-serif' },
  { name: 'Be Vietnam Pro',      source: 'google', category: 'sans-serif' },
  { name: 'Barlow',              source: 'google', category: 'sans-serif' },
  { name: 'Barlow Condensed',    source: 'google', category: 'sans-serif' },
  { name: 'Chivo',               source: 'google', category: 'sans-serif' },
  { name: 'Commissioner',        source: 'google', category: 'sans-serif' },
  { name: 'Encode Sans',         source: 'google', category: 'sans-serif' },
  { name: 'IBM Plex Sans',       source: 'google', category: 'sans-serif' },
  { name: 'Inter Tight',         source: 'google', category: 'sans-serif' },
  { name: 'Noto Sans',           source: 'google', category: 'sans-serif' },

  // ── Serif (Google) ──
  { name: 'Playfair Display',    source: 'google', category: 'serif' },
  { name: 'Merriweather',        source: 'google', category: 'serif' },
  { name: 'Lora',                source: 'google', category: 'serif' },
  { name: 'Roboto Slab',         source: 'google', category: 'serif' },
  { name: 'PT Serif',            source: 'google', category: 'serif' },
  { name: 'Crimson Text',        source: 'google', category: 'serif' },
  { name: 'Crimson Pro',         source: 'google', category: 'serif' },
  { name: 'Libre Baskerville',   source: 'google', category: 'serif' },
  { name: 'Libre Caslon Text',   source: 'google', category: 'serif' },
  { name: 'Cormorant',           source: 'google', category: 'serif' },
  { name: 'Cormorant Garamond',  source: 'google', category: 'serif' },
  { name: 'EB Garamond',         source: 'google', category: 'serif' },
  { name: 'Tinos',               source: 'google', category: 'serif' },
  { name: 'Bitter',              source: 'google', category: 'serif' },
  { name: 'Vollkorn',            source: 'google', category: 'serif' },
  { name: 'Spectral',            source: 'google', category: 'serif' },
  { name: 'DM Serif Display',    source: 'google', category: 'serif' },
  { name: 'DM Serif Text',       source: 'google', category: 'serif' },
  { name: 'Yeseva One',          source: 'google', category: 'serif' },
  { name: 'Marcellus',           source: 'google', category: 'serif' },
  { name: 'Cinzel',              source: 'google', category: 'serif' },
  { name: 'Cinzel Decorative',   source: 'google', category: 'serif' },
  { name: 'Italiana',            source: 'google', category: 'serif' },
  { name: 'Cardo',               source: 'google', category: 'serif' },
  { name: 'Alegreya',            source: 'google', category: 'serif' },
  { name: 'Crete Round',         source: 'google', category: 'serif' },
  { name: 'Bree Serif',          source: 'google', category: 'serif' },
  { name: 'Domine',              source: 'google', category: 'serif' },
  { name: 'IBM Plex Serif',      source: 'google', category: 'serif' },
  { name: 'Source Serif 4',      source: 'google', category: 'serif' },
  { name: 'Noto Serif',          source: 'google', category: 'serif' },
  { name: 'Frank Ruhl Libre',    source: 'google', category: 'serif' },

  // ── Display (Google) ──
  { name: 'Abril Fatface',       source: 'google', category: 'display' },
  { name: 'Alfa Slab One',       source: 'google', category: 'display' },
  { name: 'Russo One',           source: 'google', category: 'display' },
  { name: 'Black Ops One',       source: 'google', category: 'display' },
  { name: 'Press Start 2P',      source: 'google', category: 'display' },
  { name: 'Bungee',              source: 'google', category: 'display' },
  { name: 'Bowlby One',          source: 'google', category: 'display' },
  { name: 'Concert One',         source: 'google', category: 'display' },
  { name: 'Bangers',             source: 'google', category: 'display' },
  { name: 'Fugaz One',           source: 'google', category: 'display' },
  { name: 'Lilita One',          source: 'google', category: 'display' },
  { name: 'Patua One',           source: 'google', category: 'display' },
  { name: 'Righteous',           source: 'google', category: 'display' },
  { name: 'Sigmar One',          source: 'google', category: 'display' },
  { name: 'Staatliches',         source: 'google', category: 'display' },
  { name: 'Ultra',               source: 'google', category: 'display' },
  { name: 'Faster One',          source: 'google', category: 'display' },
  { name: 'Special Elite',       source: 'google', category: 'display' },

  // ── Handwriting / Script (Google) ──
  { name: 'Dancing Script',      source: 'google', category: 'handwriting' },
  { name: 'Caveat',              source: 'google', category: 'handwriting' },
  { name: 'Indie Flower',        source: 'google', category: 'handwriting' },
  { name: 'Permanent Marker',    source: 'google', category: 'handwriting' },
  { name: 'Shadows Into Light',  source: 'google', category: 'handwriting' },
  { name: 'Cookie',              source: 'google', category: 'handwriting' },
  { name: 'Sacramento',          source: 'google', category: 'handwriting' },
  { name: 'Great Vibes',         source: 'google', category: 'handwriting' },
  { name: 'Satisfy',             source: 'google', category: 'handwriting' },
  { name: 'Pacifico',            source: 'google', category: 'handwriting' },
  { name: 'Lobster',             source: 'google', category: 'handwriting' },
  { name: 'Lobster Two',         source: 'google', category: 'handwriting' },
  { name: 'Kaushan Script',      source: 'google', category: 'handwriting' },
  { name: 'Yellowtail',          source: 'google', category: 'handwriting' },
  { name: 'Allura',              source: 'google', category: 'handwriting' },
  { name: 'Pinyon Script',       source: 'google', category: 'handwriting' },
  { name: 'Amatic SC',           source: 'google', category: 'handwriting' },

  // ── Monospace (Google) ──
  { name: 'Roboto Mono',         source: 'google', category: 'monospace' },
  { name: 'Source Code Pro',     source: 'google', category: 'monospace' },
  { name: 'Fira Code',           source: 'google', category: 'monospace' },
  { name: 'JetBrains Mono',      source: 'google', category: 'monospace' },
  { name: 'IBM Plex Mono',       source: 'google', category: 'monospace' },
  { name: 'Space Mono',          source: 'google', category: 'monospace' },
  { name: 'Inconsolata',         source: 'google', category: 'monospace' },
  { name: 'Ubuntu Mono',         source: 'google', category: 'monospace' },
  { name: 'Geist Mono',          source: 'google', category: 'monospace' },

  // ── Sistema (instaladas localmente) ──
  { name: 'Arial',               source: 'system', category: 'sans-serif' },
  { name: 'Helvetica',           source: 'system', category: 'sans-serif' },
  { name: 'Verdana',             source: 'system', category: 'sans-serif' },
  { name: 'Tahoma',              source: 'system', category: 'sans-serif' },
  { name: 'Trebuchet MS',        source: 'system', category: 'sans-serif' },
  { name: 'Impact',              source: 'system', category: 'sans-serif' },
  { name: 'Times New Roman',     source: 'system', category: 'serif' },
  { name: 'Georgia',             source: 'system', category: 'serif' },
  { name: 'Palatino',            source: 'system', category: 'serif' },
  { name: 'Garamond',            source: 'system', category: 'serif' },
  { name: 'Courier New',         source: 'system', category: 'monospace' },
  { name: 'Comic Sans MS',       source: 'system', category: 'handwriting' },
  { name: 'Brush Script MT',     source: 'system', category: 'handwriting' },
]

// ─── Normalização e busca ──────────────────────────────────────────────────

export function normalizeFontQuery(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

/** Encontra entrada do catálogo por nome (case e accent insensitive). */
export function findFontInCatalog(name: string): FontEntry | null {
  const q = normalizeFontQuery(name)
  if (!q) return null
  return FONT_CATALOG.find(e => normalizeFontQuery(e.name) === q) || null
}

/**
 * Busca fuzzy no catálogo. Aceita digitação parcial e fora de ordem.
 * Ex: "playf disp" → "Playfair Display".
 * Ranking: starts-with > word-start > substring.
 */
export function searchFonts(query: string, max = 8): FontEntry[] {
  const q = normalizeFontQuery(query)
  if (!q) return []
  const words = q.split(/\s+/).filter(Boolean)

  const ranked: Array<{ entry: FontEntry; rank: number }> = []
  for (const entry of FONT_CATALOG) {
    const n = normalizeFontQuery(entry.name)
    // Todos os termos digitados precisam aparecer no nome
    if (!words.every(w => n.includes(w))) continue
    let rank = 2
    if (n.startsWith(q)) rank = 0
    else if (n.split(/\s+/).some(w => w.startsWith(q))) rank = 1
    ranked.push({ entry, rank })
  }
  ranked.sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name))
  return ranked.slice(0, max).map(r => r.entry)
}

/**
 * Testa se uma fonte do sistema está instalada localmente, usando o
 * truque clássico do canvas: renderiza um texto com a fonte alvo +
 * fallback explícito. Se a largura diferir da largura do fallback puro,
 * a fonte é a que efetivamente renderizou (logo está instalada).
 *
 * Retorna false em SSR ou quando o canvas não está disponível.
 */
export function isSystemFontInstalled(name: string): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  const sample = 'mmmmmmmmmmlli'
  const baseFonts = ['monospace', 'sans-serif', 'serif']

  const baseWidths = baseFonts.map(base => {
    ctx.font = `72px ${base}`
    return ctx.measureText(sample).width
  })
  for (let i = 0; i < baseFonts.length; i++) {
    ctx.font = `72px "${name}", ${baseFonts[i]}`
    if (ctx.measureText(sample).width !== baseWidths[i]) return true
  }
  return false
}
