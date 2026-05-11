'use client'

import React from 'react'
import { BrandDNA } from '@/types'
import { EditorState, FONT_SIZES } from './editor-types'
import { TypographyPreset, getBrandTypography } from '@/lib/brand-style'

export interface Slide {
  number: number
  /** Texto principal — mantido para backward compat */
  text?: string
  /** Título principal — frase de impacto com _word_ destaque */
  title?: string
  /** Subtítulo — frase explicativa abaixo do título */
  subtitle?: string
  /** Callout — frase curta de destaque (CTA, conclusão) */
  callout?: string
}

interface Props {
  slide: Slide
  total: number
  editor: EditorState
  brandDna: BrandDNA | null
  scale?: number
  publicationFormat: 'feed' | 'story' | 'reels'
  pilar?: string
  typography?: TypographyPreset
}

// ─── Layouts editoriais ──────────────────────────────────────────────────────
type Layout = 'hero' | 'rule' | 'numbered' | 'quote' | 'statement' | 'cta'

function pickLayout(num: number, total: number): Layout {
  if (num === 1) return 'hero'
  if (num === total) return 'cta'
  const middle = num - 2
  const styles: Layout[] = ['rule', 'numbered', 'quote', 'statement']
  return styles[middle % styles.length]
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

// ─── Background ──────────────────────────────────────────────────────────────
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

// ─── ArtCard ─────────────────────────────────────────────────────────────────
export const ArtCard = React.forwardRef<HTMLDivElement, Props>(
  ({ slide, total, editor, brandDna, scale = 1, publicationFormat, pilar, typography }, ref) => {
    const typo = typography || getBrandTypography(brandDna?.step4_typography_style)
    const TITLE_FONT = typo.title
    const BODY_FONT = typo.body
    const TITLE_WEIGHT = typo.titleWeight
    const TITLE_TRACKING = typo.titleTracking
    const isStory = publicationFormat === 'story' || publicationFormat === 'reels'

    const BASE_W = 1080
    const BASE_H = isStory ? 1920 : 1350
    const W = BASE_W * scale
    const H = BASE_H * scale

    const sizes = FONT_SIZES[editor.fontSize]
    const titleSize = sizes.title * scale
    const bodySize = sizes.body * scale

    const pad = 70 * scale
    const accentW = 6 * scale
    const logoH = 60 * scale
    const metaFont = 22 * scale
    const dashW = 32 * scale

    // Brand info
    const brandName = brandDna?.step1_brand_name || 'marca'
    const brandUrl = brandName.toLowerCase().replace(/\s+/g, '') + '.com.br'
    const categoryTag = (pilar || brandDna?.step5_content_pillars?.[0] || 'estratégia').toUpperCase()

    const layout = pickLayout(slide.number, total)

    // ── Extrai title/subtitle/callout, com fallback do antigo "text" ──
    const titleText = slide.title || slide.text || ''
    const subtitleText = slide.subtitle || ''
    const calloutText = slide.callout || ''

    const titleParts = parseParts(titleText)
    const subtitleParts = subtitleText ? parseParts(subtitleText) : []

    const goldColor = editor.accentBarColor
    const emphasisColor = editor.emphasisColor
    const textColor = editor.textColor

    // ── Header (logo + categoria) ──
    const HeaderBar = (
      <div style={{
        position: 'absolute', top: pad, left: pad, right: pad, zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {editor.logoUrl ? (
          <img src={editor.logoUrl} alt="logo" style={{ height: logoH, objectFit: 'contain' }} />
        ) : (
          <span style={{
            fontFamily: TITLE_FONT,
            fontSize: 32 * scale,
            color: textColor,
            letterSpacing: '-0.02em',
            fontStyle: 'italic',
          }}>
            <span>{brandName.replace(/360$/, '')}</span>
            {brandName.match(/360$/) && (
              <span style={{ color: goldColor, fontStyle: 'normal', fontSize: 22 * scale, marginLeft: 2 * scale, verticalAlign: 'super' }}>
                360
              </span>
            )}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 * scale }}>
          <div style={{ width: dashW, height: 1, backgroundColor: textColor, opacity: 0.6 }} />
          <span style={{
            fontSize: metaFont * 0.85,
            color: textColor,
            opacity: 0.85,
            letterSpacing: '0.22em',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {categoryTag}
          </span>
        </div>
      </div>
    )

    // ── Footer (slide counter + url) ──
    const FooterBar = editor.showHandle && (
      <div style={{
        position: 'absolute', bottom: pad, left: pad, right: pad, zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {editor.showSlideNumber && (
          <span style={{
            fontSize: metaFont,
            color: textColor,
            opacity: 0.7,
            letterSpacing: '0.22em',
            fontWeight: 500,
          }}>
            {String(slide.number).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 * scale }}>
          <div style={{ width: dashW, height: 1, backgroundColor: textColor, opacity: 0.4 }} />
          <span style={{
            fontSize: metaFont * 0.85,
            color: textColor,
            opacity: 0.7,
            letterSpacing: '0.18em',
            fontWeight: 500,
          }}>
            {brandUrl}
          </span>
        </div>
      </div>
    )

    // ── Alinhamento unificado por post (vem do editor) ──
    const align: 'left' | 'center' | 'right' = editor.textAlign || 'left'

    // ── Helpers de render — todos usam o mesmo align ──
    function renderTitle(opts: { sizeMul?: number } = {}) {
      const { sizeMul = 1 } = opts
      return (
        <h2 style={{
          fontFamily: TITLE_FONT,
          fontSize: titleSize * sizeMul,
          color: textColor,
          lineHeight: 1.05,
          letterSpacing: TITLE_TRACKING,
          fontWeight: TITLE_WEIGHT,
          fontStyle: typo.titleStyle,
          textAlign: align,
          margin: 0,
        }}>
          {titleParts.map((p, i) =>
            p.emphasis
              ? <span key={i} style={{ color: emphasisColor, fontStyle: typo.titleStyle === 'italic' ? 'normal' : 'italic', fontWeight: Math.min(TITLE_WEIGHT, 600) }}>{p.text}</span>
              : <span key={i}>{p.text}</span>
          )}
        </h2>
      )
    }

    function renderSubtitle() {
      if (!subtitleText) return null
      return (
        <p style={{
          fontFamily: BODY_FONT,
          fontSize: bodySize * 0.85,
          color: textColor,
          opacity: 0.78,
          lineHeight: 1.4,
          margin: `${28 * scale}px 0 0 0`,
          fontWeight: 400,
          textAlign: align,
        }}>
          {subtitleParts.map((p, i) =>
            p.emphasis
              ? <span key={i} style={{ color: emphasisColor, fontStyle: 'italic' }}>{p.text}</span>
              : <span key={i}>{p.text}</span>
          )}
        </p>
      )
    }

    function renderCallout() {
      if (!calloutText) return null
      return (
        <p style={{
          fontFamily: BODY_FONT,
          fontSize: bodySize * 0.95,
          color: textColor,
          lineHeight: 1.3,
          margin: `${20 * scale}px 0 0 0`,
          fontWeight: 700,
          textAlign: align,
        }}>
          {calloutText}
        </p>
      )
    }

    // Helper para items inline (rule, número, "Insight" tag)
    const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'

    // ── Decorative ──
    const TopRule = (
      <div style={{
        width: 80 * scale, height: 2,
        backgroundColor: goldColor,
        marginBottom: 32 * scale,
      }} />
    )

    // ─── Layouts ─────────────────────────────────────────────────────────

    function renderHero() {
      return (
        <div style={{
          position: 'absolute',
          left: pad, right: pad,
          top: '28%',
          zIndex: 4,
        }}>
          <div style={{ display: 'flex', justifyContent: justify }}>{TopRule}</div>
          {renderTitle({ sizeMul: 1.25 })}
          {renderSubtitle()}
          {renderCallout()}
        </div>
      )
    }

    function renderRule() {
      return (
        <div style={{
          position: 'absolute',
          left: pad, right: pad,
          top: '32%',
          zIndex: 4,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24 * scale,
            marginBottom: 28 * scale,
            justifyContent: justify,
          }}>
            <div style={{ width: 120 * scale, height: 1, backgroundColor: goldColor }} />
            <span style={{
              fontSize: metaFont,
              color: goldColor,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              Capítulo {String(slide.number - 1).padStart(2, '0')}
            </span>
          </div>
          {renderTitle({ sizeMul: 1.05 })}
          {renderSubtitle()}
          {renderCallout()}
        </div>
      )
    }

    function renderNumbered() {
      // No alinhamento à direita, inverte a ordem (texto à esquerda, número à direita)
      const isRight = align === 'right'
      const isCenter = align === 'center'

      const numberEl = (
        <div style={{
          fontFamily: TITLE_FONT,
          fontSize: titleSize * 2.4,
          color: goldColor,
          lineHeight: 0.85,
          fontStyle: 'italic',
          fontWeight: 400,
          letterSpacing: '-0.04em',
          flexShrink: 0,
        }}>
          {String(slide.number - 1).padStart(2, '0')}
        </div>
      )

      const contentEl = (
        <div style={{ flex: 1, paddingTop: 20 * scale }}>
          <div style={{ width: 60 * scale, height: 1, backgroundColor: goldColor, marginBottom: 24 * scale, marginLeft: justify === 'flex-end' ? 'auto' : justify === 'center' ? 'auto' : 0, marginRight: justify === 'flex-end' ? 0 : justify === 'center' ? 'auto' : undefined }} />
          {renderTitle({ sizeMul: 0.92 })}
          {renderSubtitle()}
          {renderCallout()}
        </div>
      )

      return (
        <div style={{
          position: 'absolute',
          left: pad, right: pad,
          top: '28%',
          zIndex: 4,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 40 * scale,
          flexDirection: isCenter ? 'column' : (isRight ? 'row-reverse' : 'row'),
          textAlign: align,
        }}>
          {numberEl}
          {contentEl}
        </div>
      )
    }

    function renderQuote() {
      return (
        <div style={{
          position: 'absolute',
          left: pad * 1.4, right: pad * 1.4,
          top: '30%',
          zIndex: 4,
        }}>
          <div style={{
            fontFamily: TITLE_FONT,
            fontSize: titleSize * 3.5,
            color: goldColor,
            lineHeight: 0.6,
            opacity: 0.85,
            marginBottom: -50 * scale,
            fontWeight: 700,
            fontStyle: 'italic',
          }}>
            “
          </div>
          <div style={{
            paddingLeft: 30 * scale,
            borderLeft: `${2 * scale}px solid ${goldColor}`,
          }}>
            <h2 style={{
              fontFamily: TITLE_FONT,
              fontSize: titleSize * 1.0,
              color: textColor,
              lineHeight: 1.25,
              letterSpacing: TITLE_TRACKING,
              fontWeight: 500,
              fontStyle: 'italic',
              margin: 0,
            }}>
              {titleParts.map((p, i) =>
                p.emphasis
                  ? <span key={i} style={{ color: emphasisColor, fontStyle: 'normal', fontWeight: 700 }}>{p.text}</span>
                  : <span key={i}>{p.text}</span>
              )}
            </h2>
            {subtitleText && (
              <p style={{
                fontFamily: BODY_FONT,
                fontSize: bodySize * 0.8,
                color: textColor,
                opacity: 0.7,
                lineHeight: 1.4,
                margin: `${24 * scale}px 0 0 0`,
                fontWeight: 400,
              }}>
                — {subtitleText}
              </p>
            )}
          </div>
          {renderCallout()}
        </div>
      )
    }

    function renderStatement() {
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          padding: `${pad * 2.5}px ${pad}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          zIndex: 4,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16 * scale,
            marginBottom: 36 * scale,
          }}>
            <div style={{ width: 50 * scale, height: 1, backgroundColor: goldColor }} />
            <span style={{
              fontSize: metaFont * 0.9,
              color: goldColor,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              Insight
            </span>
            <div style={{ width: 50 * scale, height: 1, backgroundColor: goldColor }} />
          </div>
          <div style={{ maxWidth: '85%' }}>
            {renderTitle({ sizeMul: 1.15 })}
            {renderSubtitle()}
            {renderCallout()}
          </div>
        </div>
      )
    }

    function renderCta() {
      return (
        <div style={{
          position: 'absolute',
          left: pad, right: pad,
          top: '24%',
          zIndex: 4,
        }}>
          <div style={{
            fontSize: metaFont,
            color: goldColor,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 28 * scale,
          }}>
            E agora?
          </div>
          {renderTitle({ sizeMul: 1.2 })}
          {renderSubtitle()}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16 * scale,
            padding: `${20 * scale}px ${36 * scale}px`,
            border: `${2 * scale}px solid ${goldColor}`,
            backgroundColor: 'transparent',
            marginTop: 40 * scale,
          }}>
            <span style={{
              fontSize: metaFont * 0.95,
              color: goldColor,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              {calloutText || 'Salve · Compartilhe · Comente'}
            </span>
          </div>
        </div>
      )
    }

    function renderBody() {
      switch (layout) {
        case 'hero':      return renderHero()
        case 'rule':      return renderRule()
        case 'numbered':  return renderNumbered()
        case 'quote':     return renderQuote()
        case 'statement': return renderStatement()
        case 'cta':       return renderCta()
        default:          return renderRule()
      }
    }

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          fontFamily: BODY_FONT,
          ...buildBackground(editor),
        }}
      >
        {editor.overlayEnabled && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            backgroundColor: editor.overlayColor,
            opacity: editor.overlayOpacity / 100,
          }} />
        )}

        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: `${50 * scale}px ${50 * scale}px`,
        }} />

        {editor.showAccentBar && (
          <div style={{
            position: 'absolute', top: 0, left: 0, zIndex: 3,
            width: accentW,
            height: '100%',
            backgroundColor: goldColor,
            opacity: 0.95,
          }} />
        )}

        {/* Watermark inicial gigante */}
        <div style={{
          position: 'absolute',
          right: pad * 0.6,
          bottom: pad * 1.8,
          zIndex: 2,
          fontFamily: TITLE_FONT,
          fontSize: 240 * scale,
          color: textColor,
          opacity: 0.025,
          fontStyle: 'italic',
          fontWeight: 700,
          lineHeight: 0.8,
          pointerEvents: 'none',
          letterSpacing: '-0.04em',
        }}>
          {brandName.charAt(0).toLowerCase()}
        </div>

        {HeaderBar}
        {renderBody()}
        {FooterBar}
      </div>
    )
  }
)

ArtCard.displayName = 'ArtCard'
