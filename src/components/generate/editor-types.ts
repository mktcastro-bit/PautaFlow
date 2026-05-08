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
  bgColor: '#0a0a0a',
  gradientFrom: '#0a0a0a',
  gradientTo: '#1a1208',
  gradientDirection: 'to bottom right',
  bgImageUrl: null,

  overlayEnabled: false,
  overlayColor: '#000000',
  overlayOpacity: 40,

  textPosition: 'center',
  fontSize: 'md',
  textColor: '#f0ece4',
  emphasisColor: '#c9a86a',

  showAccentBar: true,
  accentBarColor: '#c9a86a',
  showHandle: true,
  showSlideNumber: true,
  logoUrl: null,
  logoPosition: 'bottom-right',
}

// Valores em resolução real (1080px) — multiplicados por scale em ArtCard
// Tamanhos serif editoriais — base para os layouts que multiplicam por fatores
export const FONT_SIZES = {
  sm: { title: 64, body: 36 },
  md: { title: 84, body: 48 },
  lg: { title: 108, body: 64 },
}

export const GRADIENT_DIRECTIONS = [
  { label: 'Para baixo', value: 'to bottom' },
  { label: 'Para direita', value: 'to right' },
  { label: 'Diagonal ↘', value: 'to bottom right' },
  { label: 'Diagonal ↗', value: 'to top right' },
  { label: '135°', value: '135deg' },
]
