export interface EditorState {
  // ── Fundo ──────────────────────────────────────────────────
  bgType: 'color' | 'gradient' | 'image'
  bgColor: string
  gradientFrom: string
  gradientTo: string
  gradientDirection: string
  bgImageUrl: string | null   // data-URL ou URL externa

  // ── Overlay ────────────────────────────────────────────────
  overlayEnabled: boolean
  overlayColor: string
  overlayOpacity: number      // 0-100

  // ── Texto ──────────────────────────────────────────────────
  textPosition: 'top' | 'center' | 'bottom'
  fontSize: 'sm' | 'md' | 'lg'
  textColor: string
  emphasisColor: string

  // ── Elementos ──────────────────────────────────────────────
  showAccentBar: boolean
  accentBarColor: string
  showHandle: boolean
  showSlideNumber: boolean
  logoUrl: string | null
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const DEFAULT_EDITOR: EditorState = {
  bgType: 'color',
  bgColor: '#0a0a0f',
  gradientFrom: '#0a0a0f',
  gradientTo: '#1a1040',
  gradientDirection: 'to bottom right',
  bgImageUrl: null,

  overlayEnabled: false,
  overlayColor: '#000000',
  overlayOpacity: 40,

  textPosition: 'center',
  fontSize: 'md',
  textColor: '#ffffff',
  emphasisColor: '#6366f1',

  showAccentBar: true,
  accentBarColor: '#6366f1',
  showHandle: true,
  showSlideNumber: true,
  logoUrl: null,
  logoPosition: 'bottom-right',
}

export const FONT_SIZES = {
  sm: { title: 15, body: 13 },
  md: { title: 19, body: 15 },
  lg: { title: 24, body: 18 },
}

export const GRADIENT_DIRECTIONS = [
  { label: 'Para baixo', value: 'to bottom' },
  { label: 'Para direita', value: 'to right' },
  { label: 'Diagonal ↘', value: 'to bottom right' },
  { label: 'Diagonal ↗', value: 'to top right' },
  { label: '135°', value: '135deg' },
]
