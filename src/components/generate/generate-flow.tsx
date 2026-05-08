'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, ChevronLeft, Edit2, X, Copy, Check, Plus, BookmarkPlus } from 'lucide-react'
import { BrandDNA, Workspace } from '@/types'
import { cn } from '@/lib/utils'
import { ArtCanvas } from './art-canvas'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Idea { title: string; subtitle: string }
interface Slide { number: number; text: string }

type Step = 'texto' | 'arte'
type LoadingState = null | 'ideas' | 'slides'

interface Config {
  pilar: string
  platform: string
  format: string
  variant: 'dark' | 'light'
  publicationFormat: 'feed' | 'story' | 'reels'
  suggestion: string
}

interface Props {
  workspace: Workspace
  brandDna: BrandDNA | null
  pilars: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSlideParts(text: string) {
  const parts: Array<{ text: string; emphasis: boolean }> = []
  const regex = /_([^_]+)_/g
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), emphasis: false })
    parts.push({ text: match[1], emphasis: true })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), emphasis: false })
  return parts
}

const FORMATS = ['Carrossel', 'Post', 'Reels', 'Stories', 'Thread', 'Artigo']
const PLATFORMS = ['Instagram', 'LinkedIn', 'Ambos']

// ─── DNA Banner ──────────────────────────────────────────────────────────────

function DnaBanner({ dna, workspaceSlug }: { dna: BrandDNA | null; workspaceSlug: string }) {
  if (!dna?.completed) return (
    <div className="px-5 py-2.5 bg-amber-950/30 border-b border-amber-800/30 text-xs text-amber-400 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
        DNA da Marca não configurado — conteúdo será gerado sem personalização de marca
      </div>
      <a href={`/workspaces/${workspaceSlug}/brand-dna`} className="underline hover:text-amber-300 transition-colors">
        Configurar agora
      </a>
    </div>
  )

  const tone = dna.step3_tone?.join('/') || ''
  const position = dna.step5_market_position || ''
  const style = dna.step4_typography_style?.replace(/-/g, ' ') || ''

  return (
    <div className="px-5 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
        <span>Gerando como </span>
        <span className="text-white font-semibold">{dna.step1_brand_name}</span>
        {tone && <><span className="text-zinc-600">·</span><span>tom {tone}</span></>}
        {position && <><span className="text-zinc-600">·</span><span>{position}</span></>}
        {style && <><span className="text-zinc-600">·</span><span>visual {style}</span></>}
      </div>
      <a
        href={`/workspaces/${workspaceSlug}/brand-dna`}
        className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
      >
        <Edit2 className="h-3 w-3" /> Editar DNA
      </a>
    </div>
  )
}

// ─── Config Panel ─────────────────────────────────────────────────────────────

function PilarEditor({ pilars, onChange }: { pilars: string[]; onChange: (p: string[]) => void }) {
  const [input, setInput] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  function add() {
    const v = input.trim()
    if (v && !pilars.includes(v)) onChange([...pilars, v])
    setInput('')
  }

  return (
    <div ref={ref} className="mt-2 bg-zinc-900 border border-zinc-700 rounded-xl p-3 space-y-2">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Editar pilares</p>
      <div className="flex flex-wrap gap-1.5">
        {pilars.map(p => (
          <span key={p} className="inline-flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300">
            {p}
            <button type="button" onClick={() => onChange(pilars.filter(x => x !== p))} className="text-zinc-600 hover:text-red-400 transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Novo pilar..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-white" />
        </button>
      </div>
    </div>
  )
}

function ConfigPanel({
  config, setConfig, pilars, onGenerate, loading,
}: {
  config: Config
  setConfig: (c: Config) => void
  pilars: string[]
  onGenerate: () => void
  loading: LoadingState
}) {
  const set = (key: keyof Config) => (val: string) =>
    setConfig({ ...config, [key]: val })

  const [editingPilars, setEditingPilars] = useState(false)
  const [localPilars, setLocalPilars] = useState<string[]>(pilars)

  // Sincroniza quando pilars externos mudam
  useEffect(() => { setLocalPilars(pilars) }, [pilars])

  function handlePilarChange(updated: string[]) {
    setLocalPilars(updated)
    if (updated.length > 0 && !updated.includes(config.pilar)) {
      setConfig({ ...config, pilar: updated[0] })
    }
  }

  const activePilars = localPilars.length > 0 ? localPilars : ['Geral']

  return (
    <div className="w-60 flex-shrink-0 border-r border-zinc-800 flex flex-col">
      <div className="p-4 flex-1 space-y-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Configurações</p>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Pilar</label>
          <div className="flex items-center gap-1">
            <select
              value={config.pilar}
              onChange={e => set('pilar')(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {activePilars.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setEditingPilars(o => !o)}
              className={cn('p-1.5 rounded-lg transition-colors', editingPilars ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-zinc-300')}
              title="Editar pilares"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {editingPilars && (
            <PilarEditor pilars={localPilars} onChange={handlePilarChange} />
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Rede Social</label>
          <select
            value={config.platform}
            onChange={e => set('platform')(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Formato de Conteúdo</label>
          <select
            value={config.format}
            onChange={e => set('format')(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Variante Visual</label>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map(v => (
              <button
                key={v}
                onClick={() => set('variant')(v)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-sm capitalize border transition-colors',
                  config.variant === v
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                )}
              >
                {v === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Formato de Publicação</label>
          <div className="flex gap-1.5">
            {(['feed', 'story', 'reels'] as const).map(f => (
              <button
                key={f}
                onClick={() => set('publicationFormat')(f)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs capitalize border transition-colors',
                  config.publicationFormat === f
                    ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                )}
              >
                {f === 'feed' ? '⊞ Feed' : f === 'story' ? '▯ Story' : '▷ Reels'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
            Sugestão <span className="text-zinc-600">(opcional)</span>
          </label>
          <textarea
            value={config.suggestion}
            onChange={e => set('suggestion')(e.target.value)}
            placeholder="Ex: algo sobre empresas que usam IA mas não veem resultado..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={onGenerate}
          disabled={loading === 'ideas'}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
        >
          {loading === 'ideas' ? (
            <><div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Gerando...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> + Sugerir Ideias</>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Idea Grid ────────────────────────────────────────────────────────────────

function IdeaGrid({
  ideas, onSelect, loading,
}: {
  ideas: Idea[]
  onSelect: (idea: Idea) => void
  loading: LoadingState
}) {
  if (loading === 'ideas') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Gerando ideias com IA...</p>
        </div>
      </div>
    )
  }

  if (ideas.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-zinc-600">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Configure e clique em "+ Sugerir Ideias"</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">Escolha uma Ideia</p>
      <div className="grid grid-cols-2 gap-3">
        {ideas.map((idea, i) => (
          <button
            key={i}
            onClick={() => onSelect(idea)}
            className="text-left bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-indigo-500 rounded-xl p-4 transition-all group"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">
              Ideia {i + 1}
            </p>
            <p className="text-white font-semibold text-sm leading-snug mb-2">{idea.title}</p>
            <p className="text-zinc-400 text-xs leading-relaxed">{idea.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Slide Preview ────────────────────────────────────────────────────────────

function SlidePreview({
  idea, slides, caption, loading, config, workspace, savedPautaId, setSavedPautaId, onBack, onApprove, onCopyCaption,
}: {
  idea: Idea
  slides: Slide[]
  caption: string
  loading: LoadingState
  config: Config
  workspace: Workspace
  savedPautaId: string | null
  setSavedPautaId: (id: string | null) => void
  onBack: () => void
  onApprove: () => void
  onCopyCaption: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleCopy() {
    await navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSavePauta() {
    setSaving(true)
    setSaveError(null)
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
          description: caption || idea.subtitle,
          category: config.pilar,
          platform: plat,
          format: fmt,
          tags: [],
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      if (json.pauta?.id) setSavedPautaId(json.pauta.id)
    } catch (e: any) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading === 'slides') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-sm">Gerando texto dos slides...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Selected idea header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white leading-snug">{idea.title}</h2>
        <p className="text-zinc-400 text-sm mt-1 italic border-l-2 border-indigo-500 pl-3">{idea.subtitle}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[config.pilar, config.format, config.variant, config.platform].map(tag => (
            <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Slides */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Slides</p>
        <div className="space-y-2">
          {slides.map(slide => {
            const parts = parseSlideParts(slide.text)
            return (
              <div key={slide.number} className="flex items-start gap-3 bg-zinc-800/40 rounded-lg px-3 py-2.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest w-12 flex-shrink-0 pt-0.5">
                  Slide {slide.number}
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  {parts.map((part, i) =>
                    part.emphasis
                      ? <span key={i} className="text-white font-semibold">{part.text}</span>
                      : <span key={i}>{part.text}</span>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              Legenda {config.platform}
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {copied ? <><Check className="h-3 w-3 text-green-400" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar</>}
            </button>
          </div>
          <div className="bg-zinc-800/40 rounded-lg p-3 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
            {caption}
          </div>
        </div>
      )}

      {/* Salvar como pauta */}
      <div className="pb-4">
        {saveError && (
          <p className="text-xs text-red-400 mb-2">✗ {saveError}</p>
        )}
        <button
          onClick={handleSavePauta}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        >
          {saving
            ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
            : savedPautaId
            ? <><Check className="h-4 w-4 text-green-400" /> Pauta salva — atualizar</>
            : <><BookmarkPlus className="h-4 w-4" /> Salvar como pauta</>
          }
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GenerateFlow({ workspace, brandDna, pilars }: Props) {
  const defaultPilar = pilars[0] || brandDna?.step5_content_pillars?.[0] || 'Estratégia'

  const [step, setStep] = useState<Step>('texto')
  const [loading, setLoading] = useState<LoadingState>(null)
  const [config, setConfig] = useState<Config>({
    pilar: defaultPilar,
    platform: 'Instagram',
    format: 'Carrossel',
    variant: 'dark',
    publicationFormat: 'feed',
    suggestion: '',
  })
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [caption, setCaption] = useState('')
  const [savedPautaId, setSavedPautaId] = useState<string | null>(null)

  async function handleGenerateIdeas() {
    setLoading('ideas')
    setIdeas([])
    setSelectedIdea(null)
    setSlides([])
    setCaption('')
    setSavedPautaId(null)

    const res = await fetch('/api/generate/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspace.id,
        pilar: config.pilar,
        platform: config.platform,
        format: config.format,
        suggestion: config.suggestion || undefined,
        brand_dna: brandDna,
      }),
    })

    const data = await res.json()
    setIdeas(data.ideas || [])
    setLoading(null)
  }

  async function handleSelectIdea(idea: Idea) {
    setSelectedIdea(idea)
    setLoading('slides')
    setSlides([])
    setCaption('')
    setSavedPautaId(null)

    const res = await fetch('/api/generate/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspace.id,
        title: idea.title,
        subtitle: idea.subtitle,
        pilar: config.pilar,
        platform: config.platform,
        format: config.format,
        publicationFormat: config.publicationFormat,
        variant: config.variant,
        brand_dna: brandDna,
      }),
    })

    const data = await res.json()
    setSlides(data.slides || [])
    setCaption(data.caption || '')
    setLoading(null)
  }

  function handleBack() {
    setSelectedIdea(null)
    setSlides([])
    setCaption('')
  }

  const showSlides = selectedIdea !== null && loading !== 'ideas'
  const canApprove = slides.length > 0 && !loading

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-sm">Gerar Conteúdo</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Steps */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('texto')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors',
                step === 'texto' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <span className="h-4 w-4 rounded-full bg-current text-white flex items-center justify-center text-[9px] font-black">
                {step === 'texto' ? <span className="text-black">1</span> : '1'}
              </span>
              TEXTO
            </button>
            <button
              onClick={() => canApprove && setStep('arte')}
              disabled={!canApprove}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors',
                step === 'arte' ? 'bg-white text-black' : 'text-zinc-500 disabled:opacity-30',
                canApprove && step !== 'arte' && 'hover:text-zinc-300'
              )}
            >
              <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[9px]">2</span>
              ARTE
            </button>
          </div>
        </div>
      </div>

      {/* DNA Banner */}
      <DnaBanner dna={brandDna} workspaceSlug={workspace.slug} />

      {/* Body */}
      {step === 'texto' ? (
        <div className="flex flex-1 overflow-hidden">
          <ConfigPanel
            config={config}
            setConfig={setConfig}
            pilars={
              pilars.length > 0 ? pilars
              : (brandDna?.step5_content_pillars?.length ?? 0) > 0 ? brandDna!.step5_content_pillars!
              : ['Estratégia', 'Cases', 'Educação', 'Bastidores', 'Tendências']
            }
            onGenerate={handleGenerateIdeas}
            loading={loading}
          />

          {showSlides ? (
            <SlidePreview
              idea={selectedIdea!}
              slides={slides}
              caption={caption}
              loading={loading}
              config={config}
              workspace={workspace}
              savedPautaId={savedPautaId}
              setSavedPautaId={setSavedPautaId}
              onBack={handleBack}
              onApprove={() => setStep('arte')}
              onCopyCaption={() => navigator.clipboard.writeText(caption)}
            />
          ) : (
            <IdeaGrid ideas={ideas} onSelect={handleSelectIdea} loading={loading} />
          )}
        </div>
      ) : (
        <ArtCanvas
          slides={slides}
          caption={caption}
          idea={selectedIdea!}
          config={config}
          brandDna={brandDna}
          workspace={workspace}
          savedPautaId={savedPautaId}
          setSavedPautaId={setSavedPautaId}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800">
        {step === 'texto' && showSlides ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Escolher outra ideia
          </button>
        ) : (
          <div />
        )}

        {step === 'texto' && showSlides && canApprove ? (
          <button
            onClick={() => setStep('arte')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Aprovar e Gerar Arte →
          </button>
        ) : step === 'arte' ? (
          <button
            onClick={() => setStep('texto')}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar ao texto
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
