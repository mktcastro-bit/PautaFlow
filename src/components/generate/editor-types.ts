// ─── Elementos livres (formas, ícones, imagens) ──────────────────────────────
// Cada elemento é posicionado em % da resolução do card (0-100) para que
// sobreviva à conversão preview ↔ export sem perder posição/tamanho.
// O bounding box (x, y, w, h) define onde o elemento é desenhado; rotation
// é aplicada como transform na renderização.

export interface BaseCardElement {
  id: string
  x: number          // 0-100, % da largura do card (canto superior esquerdo do bbox)
  y: number          // 0-100, % da altura do card
  w: number          // 0-100, % da largura do card
  h: number          // 0-100, % da altura do card
  rotation: number   // graus
  opacity: number    // 0-100
}

export interface ShapeCardElement extends BaseCardElement {
  type: 'shape'
  shape: 'circle' | 'rect' | 'line' | 'triangle'
  color: string
}

export interface IconCardElement extends BaseCardElement {
  type: 'icon'
  icon: string       // chave em ELEMENT_ICONS (ver element-icons.ts)
  color: string
}

export interface ImageCardElement extends BaseCardElement {
  type: 'image'
  url: string
}

export type CardElement = ShapeCardElement | IconCardElement | ImageCardElement

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
  textAlign: 'left' | 'center' | 'right'   // alinhamento unificado de todos os slides
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
  logoSize: number  // altura da logo em px na resolução base (1080) — multiplicada por scale no render

  // ── Elementos livres ───────────────────────────────────────
  elements: CardElement[]
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
  textAlign: 'left',
  fontSize: 'md',
  textColor: '#f0ece4',
  emphasisColor: '#c9a86a',

  showAccentBar: true,
  accentBarColor: '#c9a86a',
  showHandle: true,
  showSlideNumber: true,
  logoUrl: null,
  logoPosition: 'bottom-right',
  logoSize: 60,

  elements: [],
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
