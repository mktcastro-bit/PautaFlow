'use client'

import React from 'react'
import { BrandDNA } from '@/types'
import { EditorState, FONT_SIZES } from './editor-types'

export interface Slide { number: number; text: string }

interface Props {
  slide: Slide
  total: number
  editor: EditorState
  brandDna: BrandDNA | null
  /** Escala de exibição (1 = tamanho real exportável, <1 = preview) */
  scale?: number
  /** Formato de publicação — define proporção */
  publicationFormat: 'feed' | 'story' | 'reels'
}

// ─── Parse _emphasis_ ────────────────────────────────────────────────────────

function parseParts(text: string) {
  const parts: Array<{ text: string; emphasis: boolean }> = []
  const regex = /_([^_]+)_/g
  let last = 0
  let m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), emphasis: false })
    parts.push({ text: m[1], emphasis: true })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), emphasis: false })
  return parts
}

// ─── Background style ────────────────────────────────────────────────────────

function buildBackground(editor: EditorState): React.CSSProperties {
  if (editor.bgType === 'gradient') {
    return { background: `linear-gradient(${editor.gradientDirection}, ${editor.gradientFrom}, ${editor.gradientTo})` }
  }
  if (editor.bgType === 'image' && editor.bgImageUrl) {
    return {
      backgroundImage: `url(${editor.bgImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { backgroundColor: editor.bgColor }
}

// ─── Text position ────────────────────────────────────────────────────────────

const JUSTIFY: Record<string, string> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
}

// ─── ArtCard ─────────────────────────────────────────────────────────────────

export const ArtCard = React.forwardRef<HTMLDivElement, Props>(
  ({ slide, total, editor, brandDna, scale = 1, publicationFormat }, ref) => {
    const isStory = publicationFormat === 'story' || publicationFormat === 'reels'

    // Dimensões base — feed/padrão: 1080×1350 | story/reels: 1080×1920
    const BASE_W = 1080
    const BASE_H = isStory ? 1920 : 1350

    // Dimensões de display
    const W = BASE_W * scale
    const H = BASE_H * scale

    // Todos os valores em resolução real (1080px) × scale
    const sizes = FONT_SIZES[editor.fontSize]
    const titleSize = sizes.title * scale
    const bodySize = sizes.body * scale

    const pad = 80 * scale          // margem interna
    const accentW = 14 * scale      // largura da barra de acento
    const logoH = 100 * scale       // altura do logo
    const metaFont = 28 * scale     // handle / slide number
    const lineW = 56 * scale        // linha decorativa

    const handle = brandDna?.step1_brand_name
      ? '@' + brandDna.step1_brand_name.toLowerCase().replace(/\s+/g, '')
      : '@marca'

    const parts = parseParts(slide.text)
    const isFirst = slide.number === 1

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
          ...buildBackground(editor),
        }}
      >
        {/* Overlay */}
        {editor.overlayEnabled && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            backgroundColor: editor.overlayColor,
            opacity: editor.overlayOpacity / 100,
          }} />
        )}

        {/* Accent bar (left) */}
        {editor.showAccentBar && (
          <div style={{
            position: 'absolute', top: 0, left: 0, zIndex: 2,
            width: accentW,
            height: '100%',
            backgroundColor: editor.accentBarColor,
          }} />
        )}

        {/* Subtle texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: `${60 * scale}px ${60 * scale}px`,
        }} />

        {/* Slide number */}
        {editor.showSlideNumber && (
          <div style={{
            position: 'absolute', top: pad, right: pad, zIndex: 3,
            fontSize: metaFont,
            color: editor.accentBarColor,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}>
            {slide.number}/{total}
          </div>
        )}

        {/* Logo */}
        {editor.logoUrl && (
          <img
            src={editor.logoUrl}
            alt="logo"
            style={{
              position: 'absolute',
              zIndex: 4,
              height: logoH,
              objectFit: 'contain',
              ...(editor.logoPosition === 'top-left' && { top: pad, left: pad }),
              ...(editor.logoPosition === 'top-right' && { top: pad, right: pad }),
              ...(editor.logoPosition === 'bottom-left' && { bottom: pad * 1.5, left: pad }),
              ...(editor.logoPosition === 'bottom-right' && { bottom: pad * 1.5, right: pad }),
            }}
          />
        )}

        {/* Main text */}
        <div style={{
          position: 'absolute',
          top: editor.showAccentBar ? accentW : 0,
          bottom: 0,
          left: editor.showAccentBar ? accentW : 0,
          right: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: JUSTIFY[editor.textPosition],
          padding: `${pad}px ${pad}px ${pad + (editor.showHandle ? metaFont * 2 : 0)}px ${pad}px`,
        }}>
          <div style={{
            fontSize: titleSize,
            fontWeight: isFirst ? 800 : 700,
            color: editor.textColor,
            lineHeight: isFirst ? 1.15 : 1.3,
            letterSpacing: isFirst ? '-0.02em' : '-0.01em',
            whiteSpace: 'pre-line',
          }}>
            {parts.map((p, i) =>
              p.emphasis
                ? <span key={i} style={{ color: editor.emphasisColor }}>{p.text}</span>
                : <span key={i}>{p.text}</span>
            )}
          </div>
        </div>

        {/* Bottom bar / handle */}
        {editor.showHandle && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: editor.showAccentBar ? accentW : 0,
            right: 0,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${pad * 0.4}px ${pad}px`,
            borderTop: `${Math.max(1, scale)}px solid rgba(255,255,255,0.07)`,
          }}>
            <span style={{
              fontSize: metaFont,
              color: editor.accentBarColor,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              {handle}
            </span>
            <div style={{
              width: lineW,
              height: Math.max(1, 3 * scale),
              backgroundColor: editor.accentBarColor,
              borderRadius: 999,
            }} />
          </div>
        )}
      </div>
    )
  }
)

ArtCard.displayName = 'ArtCard'
