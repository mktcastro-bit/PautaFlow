'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Slide, LayoutKey, SlideElement } from './art-card'

interface Props {
  slide: Slide
  slideNumber: number
  total: number
  onChange: (overrides: NonNullable<Slide['overrides']>) => void
}

// Decide qual layout efetivamente está sendo usado neste slide
function effectiveLayout(slide: Slide, slideNumber: number, total: number): LayoutKey {
  if (slide.overrides?.layout && slide.overrides.layout !== 'auto') return slide.overrides.layout
  if (slideNumber === 1) return 'hero'
  if (slideNumber === total) return 'cta'
  const middle = slideNumber - 2
  const styles: LayoutKey[] = ['rule', 'numbered', 'quote', 'statement']
  return styles[middle % styles.length]
}

// Elementos disponíveis por layout
const LAYOUT_ELEMENTS: Record<LayoutKey, Array<{ id: SlideElement; label: string }>> = {
  hero: [
    { id: 'topRule',  label: 'Linha dourada superior' },
    { id: 'subtitle', label: 'Subtítulo' },
    { id: 'callout',  label: 'Callout' },
  ],
  rule: [
    { id: 'chapterTag', label: 'Tag "Capítulo XX"' },
    { id: 'subtitle',   label: 'Subtítulo' },
    { id: 'callout',    label: 'Callout' },
  ],
  numbered: [
    { id: 'bigNumber',     label: 'Número grande' },
    { id: 'numberDivider', label: 'Linha sob o número' },
    { id: 'subtitle',      label: 'Subtítulo' },
    { id: 'callout',       label: 'Callout' },
  ],
  quote: [
    { id: 'quoteMarks',  label: 'Aspas grandes "' },
    { id: 'quoteBorder', label: 'Borda lateral dourada' },
    { id: 'subtitle',    label: 'Atribuição (— autor)' },
    { id: 'callout',     label: 'Callout' },
  ],
  statement: [
    { id: 'insightTag', label: 'Tag "INSIGHT" + linhas laterais' },
    { id: 'subtitle',   label: 'Subtítulo' },
    { id: 'callout',    label: 'Callout' },
  ],
  cta: [
    { id: 'ctaArrow', label: 'Texto "E agora?"' },
    { id: 'ctaBox',   label: 'Caixa CTA com bordas' },
    { id: 'subtitle', label: 'Subtítulo' },
  ],
  auto: [],
}

const LAYOUT_LABELS: Record<LayoutKey, string> = {
  auto: 'Automático (rotação)',
  hero: 'Hero — título grande + linha',
  rule: 'Rule — capítulo + título',
  numbered: 'Numbered — número grande',
  quote: 'Quote — aspas + borda',
  statement: 'Statement — centrado + INSIGHT',
  cta: 'CTA — caixa de ação',
}

export function SlideOverridesPanel({ slide, slideNumber, total, onChange }: Props) {
  const [expanded, setExpanded] = useState(true)

  const currentLayout = effectiveLayout(slide, slideNumber, total)
  const layoutChoice = slide.overrides?.layout || 'auto'
  const hidden = new Set(slide.overrides?.hide || [])
  const elements = LAYOUT_ELEMENTS[currentLayout] || []

  function setLayout(layout: LayoutKey) {
    onChange({
      ...(slide.overrides || {}),
      layout,
    })
  }

  function toggleElement(id: SlideElement) {
    const next = new Set(hidden)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange({
      ...(slide.overrides || {}),
      hide: Array.from(next),
    })
  }

  function resetAll() {
    onChange({})
  }

  const hasOverrides = layoutChoice !== 'auto' || hidden.size > 0

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded">

      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-900/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-gold">
            Slide {slideNumber}
          </span>
          <span className="text-[10px] tracking-wide text-zinc-500 capitalize">
            · {currentLayout}
          </span>
          {hasOverrides && (
            <span className="text-[9px] tracking-wide text-gold/80 bg-gold/10 border border-gold/30 px-1.5 py-0.5">
              customizado
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-zinc-800">

          {/* Layout picker */}
          <div className="space-y-1.5">
            <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-semibold">
              Layout deste slide
            </label>
            <select
              value={layoutChoice}
              onChange={e => setLayout(e.target.value as LayoutKey)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gold/50"
            >
              {(Object.keys(LAYOUT_LABELS) as LayoutKey[]).map(k => (
                <option key={k} value={k}>{LAYOUT_LABELS[k]}</option>
              ))}
            </select>
          </div>

          {/* Element toggles */}
          {elements.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-semibold">
                Elementos visíveis
              </label>
              <div className="space-y-1">
                {elements.map(el => {
                  const visible = !hidden.has(el.id)
                  return (
                    <button
                      key={el.id}
                      onClick={() => toggleElement(el.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors',
                        visible
                          ? 'bg-gold/5 border border-gold/20 text-zinc-200 hover:bg-gold/10'
                          : 'bg-zinc-800/40 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      <span className={cn(
                        'h-3.5 w-3.5 rounded-sm border flex items-center justify-center flex-shrink-0',
                        visible ? 'bg-gold border-gold' : 'border-zinc-600'
                      )}>
                        {visible && <span className="text-ink text-[10px] font-bold leading-none">✓</span>}
                      </span>
                      <span className="text-left flex-1">{el.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {hasOverrides && (
            <button
              onClick={resetAll}
              className="w-full text-[9px] tracking-[0.2em] uppercase text-zinc-500 hover:text-gold transition-colors py-1.5 border-t border-zinc-800 mt-2"
            >
              ↺ Restaurar padrão deste slide
            </button>
          )}
        </div>
      )}
    </div>
  )
}
