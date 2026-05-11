'use client'

import { useState, useRef } from 'react'
import { Download, Copy, Check, ChevronLeft, ChevronRight, Loader2, BookmarkPlus, Archive } from 'lucide-react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { BrandDNA, Workspace } from '@/types'
import { cn } from '@/lib/utils'
import { ArtCard, Slide } from './art-card'
import { ArtEditor } from './art-editor'
import { EditorState, DEFAULT_EDITOR } from './editor-types'
import { getBrandPalette, getBrandTypography } from '@/lib/brand-style'

interface Idea { title: string; subtitle: string }

interface Config {
  pilar: string
  platform: string
  format: string
  variant: 'dark' | 'light'
  publicationFormat: 'feed' | 'story' | 'reels'
  suggestion: string
}

interface Props {
  slides: Slide[]
  caption: string
  idea: Idea
  config: Config
  brandDna: BrandDNA | null
  workspace: Workspace
  savedPautaId: string | null
  setSavedPautaId: (id: string | null) => void
  initialEditorState?: Partial<EditorState> | null
}

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

export function ArtCanvas({ slides, caption, idea, config, brandDna, workspace, savedPautaId, setSavedPautaId, initialEditorState }: Props) {
  const [current, setCurrent] = useState(0)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })
  const [savingPauta, setSavingPauta] = useState(false)
  const [pautaError, setPautaError] = useState<string | null>(null)
  const [pautaJustSaved, setPautaJustSaved] = useState(false)
  const [editor, setEditor] = useState<EditorState>(() => {
    // Prioridade: estado salvo da pauta > paleta da marca > padrão
    if (initialEditorState && Object.keys(initialEditorState).length > 0) {
      return { ...DEFAULT_EDITOR, ...initialEditorState }
    }
    const palette = getBrandPalette(brandDna)
    return {
      ...DEFAULT_EDITOR,
      bgColor: palette.bg,
      gradientFrom: palette.bg,
      textColor: palette.text,
      accentBarColor: palette.accent,
      emphasisColor: palette.emphasis,
    }
  })

  // Tipografia derivada do DNA — usada nos cards
  const typography = getBrandTypography(brandDna?.step4_typography_style)

  const exportRef = useRef<HTMLDivElement>(null)

  const total = slides.length
  const slide = slides[current]
  const isStory = config.publicationFormat === 'story' || config.publicationFormat === 'reels'

  // Feed/padrão: 1080×1350 (4:5) | Story/Reels: 1080×1920 (9:16)
  const CARD_W = 1080
  const CARD_H = isStory ? 1920 : 1350
  const ASPECT = CARD_H / CARD_W   // 1.25 para feed, 1.778 para story

  // Preview responsivo: ocupa até 68vh de altura, limitado por largura disponível
  const MAX_PREVIEW_H = typeof window !== 'undefined'
    ? Math.round(window.innerHeight * 0.68)
    : isStory ? 560 : 500
  const BY_HEIGHT_W = Math.round(MAX_PREVIEW_H / ASPECT)
  const MAX_PREVIEW_W = isStory ? 340 : 480
  const PREVIEW_W = Math.min(BY_HEIGHT_W, MAX_PREVIEW_W)
  const PREVIEW_H = Math.round(PREVIEW_W * ASPECT)
  const PREVIEW_SCALE = PREVIEW_W / CARD_W

  async function handleExportCurrent() {
    if (!exportRef.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 1 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `slide-${slide.number}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  async function handleExportAll() {
    setExporting(true)
    setExportProgress({ current: 0, total: slides.length })
    try {
      const zip = new JSZip()
      // Slug para nome de arquivo a partir do título da ideia
      const baseName = (idea.title || 'pauta')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'pauta'

      for (let i = 0; i < slides.length; i++) {
        setCurrent(i)
        // Aguarda render do slide selecionado
        await new Promise(r => setTimeout(r, 250))
        if (!exportRef.current) continue
        const dataUrl = await toPng(exportRef.current, { pixelRatio: 1 })
        // Converte data URL para blob
        const base64 = dataUrl.split(',')[1]
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true })
        setExportProgress({ current: i + 1, total: slides.length })
      }

      // Adiciona a legenda como txt no zip
      if (caption) zip.file('legenda.txt', caption)

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}.zip`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } finally {
      setExporting(false)
      setExportProgress({ current: 0, total: 0 })
    }
  }

  async function handleCopyCaption() {
    await navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSavePauta() {
    setSavingPauta(true)
    setPautaError(null)
    try {
      const fmt = config.format.toLowerCase() as any
      const plat = config.platform === 'Ambos'
        ? ['instagram', 'linkedin']
        : [config.platform.toLowerCase()]

      const isUpdate = !!savedPautaId
      const res = await fetch('/api/pautas', {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isUpdate ? { id: savedPautaId } : { workspace_id: workspace.id }),
          title: idea.title,
          description: idea.subtitle || caption?.split('\n')[0] || '',
          category: config.pilar,
          platform: plat,
          format: fmt,
          tags: [],
          slides,
          caption,
          editor_state: editor,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Erro HTTP ${res.status}`)
      if (json.pauta?.id) {
        setSavedPautaId(json.pauta.id)
        setPautaJustSaved(true)
        setTimeout(() => setPautaJustSaved(false), 3500)
      }
    } catch (e: any) {
      setPautaError(e.message || 'Falha ao salvar pauta')
    } finally {
      setSavingPauta(false)
    }
  }

  if (!slide) return null

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* ── Left: visual editor ───────────────────────────────────────── */}
      <ArtEditor editor={editor} onChange={setEditor} />

      {/* ── Center: card preview ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-between bg-zinc-900/40 py-4 px-6 overflow-hidden">

        {/* Navigation */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-zinc-400 font-medium">
            Slide {current + 1} de {total}
          </span>
          <button
            onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
            disabled={current === total - 1}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Visible preview card — ocupa o espaço central */}
        <div className="flex flex-col items-center gap-3 flex-1 justify-center">
          <div
            className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            style={{ width: PREVIEW_W, height: PREVIEW_H, flexShrink: 0 }}
          >
            <ArtCard
              slide={slide}
              total={total}
              editor={editor}
              brandDna={brandDna}
              scale={PREVIEW_SCALE}
              publicationFormat={config.publicationFormat}
              pilar={config.pilar}
              typography={typography}
            />
          </div>

          {/* Slide dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'rounded-full transition-all',
                  i === current
                    ? 'w-4 h-1.5 bg-gold'
                    : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
                )}
              />
            ))}
          </div>
        </div>

        {/* Hidden full-res card for export */}
        <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none', zIndex: -1 }}>
          <ArtCard
            ref={exportRef}
            slide={slide}
            total={total}
            editor={editor}
            brandDna={brandDna}
            scale={1}
            publicationFormat={config.publicationFormat}
            pilar={config.pilar}
            typography={typography}
          />
        </div>

        {/* Export + Save buttons */}
        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-center">
          <button
            onClick={handleExportCurrent}
            disabled={exporting}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-2 px-3 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Exportar slide
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="flex items-center gap-1.5 bg-gold hover:bg-gold-soft text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            {exporting
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {exportProgress.total > 0 ? `${exportProgress.current}/${exportProgress.total}` : 'Gerando...'}</>
              : <><Archive className="h-3.5 w-3.5" /> Baixar ZIP ({slides.length})</>
            }
          </button>
          <button
            onClick={handleSavePauta}
            disabled={savingPauta}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-gold text-white py-2 px-3 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
          >
            {savingPauta
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...</>
              : pautaJustSaved
              ? <><Check className="h-3.5 w-3.5 text-green-400" /> Salvo!</>
              : savedPautaId
              ? <><Check className="h-3.5 w-3.5 text-green-400" /> Atualizar pauta</>
              : <><BookmarkPlus className="h-3.5 w-3.5" /> Salvar como pauta</>
            }
          </button>
        </div>

        {/* Mensagem de erro do save */}
        {pautaError && (
          <div className="flex-shrink-0 max-w-md">
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 break-all">
              ✗ {pautaError}
            </p>
          </div>
        )}
      </div>

      {/* ── Right: slides list + caption ──────────────────────────────── */}
      <div className="w-64 border-l border-zinc-800 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">

          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Slides</p>
          <div className="space-y-1.5">
            {slides.map((s: any, i) => {
              const parts = parseParts(s.title || s.text || '')
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'w-full text-left rounded-lg px-3 py-2 transition-colors',
                    i === current
                      ? 'bg-gold/10 border border-gold/30'
                      : 'hover:bg-zinc-800/50 border border-transparent'
                  )}
                >
                  <p className="text-[9px] text-gold font-bold uppercase tracking-widest mb-0.5">
                    Slide {s.number}
                  </p>
                  <p className="text-xs text-zinc-300 leading-snug line-clamp-2">
                    {parts.map((p, j) =>
                      p.emphasis
                        ? <span key={j} className="text-white font-semibold">{p.text}</span>
                        : <span key={j}>{p.text}</span>
                    )}
                  </p>
                </button>
              )
            })}
          </div>

          {caption && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Legenda</p>
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {copied
                    ? <><Check className="h-3 w-3 text-green-400" /> Copiado</>
                    : <><Copy className="h-3 w-3" /> Copiar</>
                  }
                </button>
              </div>
              <div className="bg-zinc-800/40 rounded-lg p-2.5 text-[11px] text-zinc-400 whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto">
                {caption}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
