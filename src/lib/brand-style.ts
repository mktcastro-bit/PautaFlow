/**
 * Brand style — converte BrandDNA (cores + tipografia) em paleta + fontes
 * usadas no ArtCard. Fallback editorial premium quando DNA está vazio.
 */

import { BrandDNA } from '@/types'

// ─── Tipografia ──────────────────────────────────────────────────────────────

export interface TypographyPreset {
  /** CSS font-family stack para títulos */
  title: string
  /** CSS font-family stack para corpo de texto */
  body: string
  /** Peso do título (entre 400-900) */
  titleWeight: number
  /** Letter-spacing do título */
  titleTracking: string
  /** Estilo do título (normal/italic) */
  titleStyle: 'normal' | 'italic'
}

export const TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
  'moderno-minimalista': {
    title: 'var(--font-sans), Inter, system-ui, sans-serif',
    body: 'var(--font-sans), Inter, system-ui, sans-serif',
    titleWeight: 800,
    titleTracking: '-0.025em',
    titleStyle: 'normal',
  },
  'classico-elegante': {
    title: 'var(--font-serif), "Playfair Display", Georgia, serif',
    body: 'var(--font-sans), Inter, system-ui, sans-serif',
    titleWeight: 700,
    titleTracking: '-0.015em',
    titleStyle: 'normal',
  },
  'bold-impactante': {
    title: 'var(--font-display), "Bebas Neue", Impact, sans-serif',
    body: 'var(--font-sans), Inter, system-ui, sans-serif',
    titleWeight: 400,
    titleTracking: '0.005em',
    titleStyle: 'normal',
  },
  'playful-descontraido': {
    title: 'var(--font-handwriting), Caveat, "Comic Sans MS", cursive',
    body: 'var(--font-sans), Inter, system-ui, sans-serif',
    titleWeight: 700,
    titleTracking: '0',
    titleStyle: 'normal',
  },
  'tecnico-corporativo': {
    title: 'var(--font-tech), "IBM Plex Sans", "SF Pro Text", sans-serif',
    body: 'var(--font-tech), "IBM Plex Sans", "SF Pro Text", sans-serif',
    titleWeight: 600,
    titleTracking: '-0.01em',
    titleStyle: 'normal',
  },
  'editorial-moderno': {
    title: 'var(--font-grotesque), "Bricolage Grotesque", system-ui, sans-serif',
    body: 'var(--font-grotesque), "Bricolage Grotesque", system-ui, sans-serif',
    titleWeight: 700,
    titleTracking: '-0.025em',
    titleStyle: 'normal',
  },
}

// Default agora é editorial-moderno (Bricolage Grotesque) — sans-serif premium
const DEFAULT_TYPOGRAPHY: TypographyPreset = TYPOGRAPHY_PRESETS['editorial-moderno']

export function getBrandTypography(style: string | null | undefined): TypographyPreset {
  if (style && TYPOGRAPHY_PRESETS[style]) return TYPOGRAPHY_PRESETS[style]
  return DEFAULT_TYPOGRAPHY
}

// ─── Cores ───────────────────────────────────────────────────────────────────

export interface BrandPalette {
  bg: string
  text: string
  accent: string
  emphasis: string
  /** Indica se a paleta resultante é tema dark ou light */
  theme: 'dark' | 'light'
}

const DEFAULT_PALETTE: BrandPalette = {
  bg: '#0a0a0a',
  text: '#f0ece4',
  accent: '#c9a86a',
  emphasis: '#c9a86a',
  theme: 'dark',
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace(/\s/g, '').match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function brightness(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 128
  const [r, g, b] = rgb
  // Perceived brightness (ITU-R BT.601)
  return (r * 299 + g * 587 + b * 114) / 1000
}

function saturation(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb
  return Math.max(r, g, b) - Math.min(r, g, b)
}

function isLight(hex: string): boolean {
  return brightness(hex) > 200
}

function isDark(hex: string): boolean {
  return brightness(hex) < 40
}

function isVibrant(hex: string): boolean {
  return saturation(hex) > 50 && brightness(hex) > 50 && brightness(hex) < 220
}

function normalizeHex(input: string): string | null {
  const trimmed = input.trim()
  if (/^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase()
  if (/^[0-9a-f]{6}$/i.test(trimmed)) return '#' + trimmed.toLowerCase()
  return null
}

/**
 * Converte cores do DNA em uma paleta coerente para os cards.
 * Lógica:
 * - Encontra a cor "vibrante" mais forte → vira accent
 * - Se houver uma cor muito clara → tema light com bg claro e text escuro
 * - Se houver uma cor muito escura → tema dark com aquela bg
 * - Caso contrário → tema dark editorial padrão
 */
export function getBrandPalette(brandDna: BrandDNA | null | undefined): BrandPalette {
  const raw = brandDna?.step4_primary_colors || []
  const colors = raw.map(normalizeHex).filter((c): c is string => !!c)

  if (colors.length === 0) return DEFAULT_PALETTE

  const vibrants = colors.filter(isVibrant)
  const lights   = colors.filter(isLight)
  const darks    = colors.filter(isDark)

  const accent = vibrants[0] || colors.find(c => !isLight(c) && !isDark(c)) || colors[0]
  const emphasis = vibrants[1] || vibrants[0] || accent

  // Tema light: existe uma cor clara explícita E uma vibrante para contraste
  if (lights.length > 0 && vibrants.length > 0) {
    return {
      bg: lights[0],
      text: '#0a0a0a',
      accent,
      emphasis,
      theme: 'light',
    }
  }

  // Tema dark com bg customizado
  if (darks.length > 0) {
    return {
      bg: darks[0],
      text: '#f0ece4',
      accent,
      emphasis,
      theme: 'dark',
    }
  }

  // Tema dark padrão com accent da marca
  return {
    bg: '#0a0a0a',
    text: '#f0ece4',
    accent,
    emphasis,
    theme: 'dark',
  }
}
