'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, ChevronLeft, Edit2, X, Copy, Check, Plus, BookmarkPlus } from 'lucide-react'
import { BrandDNA, Workspace } from '@/types'
import { cn } from '@/lib/utils'
import { ArtCanvas } from './art-canvas'
import { UsageBadge } from '@/components/shared/usage-badge'
import { ProgressiveLoader } from '@/components/shared/progressive-loader'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Idea {
  title: string
  subtitle: string
  formula?: string  // chave da fórmula viral (atalho, guia, conselho, case, marco)
}
interface Slide {
  number: number
  text?: string
  title?: string
  subtitle?: string
  callout?: string
}

type Step = 'texto' | 'arte'
type LoadingState = null | 'ideas' | 'slides'

export type SuggestionMode = 'hint' | 'news' | 'adapt' | 'literal'
export type NewsSubMode = 'paste' | 'trends'

interface Config {
  pilar: string
  platform: string
  format: string
  variant: 'dark' | 'light'
  publicationFormat: 'feed' | 'story' | 'reels'
  suggestion: string
  suggestionMode: SuggestionMode
  newsSubMode: NewsSubMode
}

interface Props {
  workspace: Workspace
  brandDna: BrandDNA | null
  pilars: string[]
  initialPauta?: any | null  // Pauta com slides/editor_state/caption salvos
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
const PLATFORMS = ['Instagram', 'LinkedIn', 'TikTok', 'WhatsApp', 'Ambos']

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
        <Sparkles className="h-3.5 w-3.5 text-gold flex-shrink-0" />
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
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold/50"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="p-1.5 bg-gold hover:bg-gold-soft disabled:opacity-40 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-ink" />
        </button>
      </div>
    </div>
  )
}

// ─── Suggestion Block ────────────────────────────────────────────────────────

const MODE_SPECS: Record<SuggestionMode, {
  label: string
  subtitle: string
  placeholder: string
  description: string
}> = {
  hint: {
    label: 'Sugestão',
    subtitle: 'inspiração livre',
    placeholder: 'Ex: fale sobre IA na produtividade, com exemplos do varejo brasileiro…',
    description: 'A IA usa como inspiração e cria do zero. Ideal pra quando você tem apenas uma ideia geral do que postar.',
  },
  news: {
    label: 'Notícia',
    subtitle: 'atualidade',
    placeholder: 'Cole aqui a notícia. A IA vai trazer o ângulo da sua marca sobre o fato e citar a fonte quando possível.',
    description: 'Comente uma notícia atual. A IA aproveita o gancho jornalístico, traz o ângulo da sua marca e cita a fonte.',
  },
  adapt: {
    label: 'Adaptar',
    subtitle: 'artigo / post',
    placeholder: 'Cole o artigo, post antigo ou material. A IA vai extrair os pontos principais e reformular ao tom da marca.',
    description: 'Reaproveite um artigo, post antigo ou material da empresa. A IA extrai os pontos e reformula com o tom da marca.',
  },
  literal: {
    label: 'Literal',
    subtitle: 'texto pronto',
    placeholder: 'Cole o texto pronto. A IA preserva suas palavras e apenas divide em slides com destaques visuais.',
    description: 'Use seu texto exatamente como está. A IA só estrutura em slides e marca palavras-chave em dourado. Sem reescrita.',
  },
}

// Sub-modo do Notícia: colar texto OU pedir pra IA comentar tendências do pilar
function ContentBaseHero({
  config, setConfig, onGenerate, loading, genError,
}: {
  config: Config
  setConfig: (c: Config) => void
  onGenerate: () => void
  loading: LoadingState
  genError: string | null
}) {
  const newsSubMode = config.newsSubMode
  const spec = MODE_SPECS[config.suggestionMode]
  const wordCount = config.suggestion.trim() ? config.suggestion.trim().split(/\s+/).length : 0

  function setMode(m: SuggestionMode) {
    setConfig({ ...config, suggestionMode: m, newsSubMode: 'trends' })
  }

  function setNewsSubMode(s: NewsSubMode) {
    setConfig({ ...config, newsSubMode: s })
  }

  function setSuggestion(v: string) {
    setConfig({ ...config, suggestion: v })
  }

  // No sub-modo "trends" do Notícia, preenche automaticamente
  const effectivePlaceholder = config.suggestionMode === 'news' && newsSubMode === 'trends'
    ? `Vou buscar notícias atuais sobre "${config.pilar}". Você pode adicionar um ângulo opcional aqui…`
    : spec.placeholder

  // O handler agora apenas dispara o gerador — a lógica do prompt sintético
  // está no handleGenerateIdeas (no pai), evitando race condition do setConfig.
  function handleGenerateClick() {
    onGenerate()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-gold" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-semibold">
            Conteúdo base · opcional
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight leading-tight mb-3">
          Como a IA deve <span className="italic text-gold">trabalhar</span>?
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xl">
          Escolha o modo abaixo conforme o que você tem em mãos.
          Sem nada selecionado? A IA cria do zero com base no DNA da marca.
        </p>

        {/* 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {(['hint', 'news', 'adapt', 'literal'] as SuggestionMode[]).map(m => {
            const s = MODE_SPECS[m]
            const active = config.suggestionMode === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'group relative text-left p-4 border transition-all min-h-[88px] flex flex-col justify-between',
                  active
                    ? 'bg-gold/[0.08] border-gold/60'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                )}
              >
                {active && (
                  <span className="absolute top-2 right-2 text-[9px] tracking-[0.2em] uppercase text-gold font-bold">
                    ✓
                  </span>
                )}
                <p className={cn(
                  'text-sm tracking-wide uppercase font-bold',
                  active ? 'text-gold' : 'text-zinc-200'
                )}>
                  {s.label}
                </p>
                <p className={cn(
                  'text-[10px] tracking-wide mt-1',
                  active ? 'text-gold/70' : 'text-zinc-500'
                )}>
                  {s.subtitle}
                </p>
              </button>
            )
          })}
        </div>

        {/* Descrição do modo selecionado */}
        <p className="text-sm text-zinc-300 leading-relaxed mb-5 px-1">
          <span className="text-gold">→</span> {spec.description}
        </p>

        {/* Sub-tabs Notícia */}
        {config.suggestionMode === 'news' && (
          <div className="flex items-center gap-1 mb-3 border-b border-zinc-800">
            <button
              onClick={() => setNewsSubMode('trends')}
              className={cn(
                'px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-all border-b-2 -mb-px',
                newsSubMode === 'trends' ? 'border-gold text-gold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              Buscar notícia em tempo real
            </button>
            <button
              onClick={() => setNewsSubMode('paste')}
              className={cn(
                'px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase font-semibold transition-all border-b-2 -mb-px',
                newsSubMode === 'paste' ? 'border-gold text-gold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              Colar notícia
            </button>
          </div>
        )}

        {/* Textarea ou tela "tendências" */}
        {config.suggestionMode === 'news' && newsSubMode === 'trends' ? (
          <div className="bg-zinc-900/60 border border-zinc-800 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-bold bg-gold/10 border border-gold/30 px-2 py-0.5">
                ⚡ Busca em tempo real
              </span>
            </div>
            <p className="text-sm text-zinc-300 mb-3 leading-relaxed">
              A IA vai <strong className="text-gold">buscar notícias atuais</strong> sobre o pilar
              <strong className="text-foreground"> {config.pilar}</strong>, escolher a mais relevante
              e estruturar o conteúdo com o ângulo da sua marca, citando a fonte.
            </p>
            <p className="text-[10px] tracking-[0.18em] uppercase text-zinc-500 mb-3">
              Foco adicional (opcional)
            </p>
            <textarea
              value={config.suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder="Ex: foque em PMEs · evite cases de big tech · ângulo crítico…"
              rows={3}
              className="w-full bg-background border border-zinc-700 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-gold/50 resize-none"
            />
            <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed">
              ✓ Busca real-time via Claude · pode levar mais tempo · consome 1 geração do plano
            </p>
          </div>
        ) : (
          <div className="relative mb-4">
            <textarea
              value={config.suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder={effectivePlaceholder}
              rows={config.suggestionMode === 'hint' ? 4 : 7}
              className="w-full bg-zinc-900/60 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-gold/50 resize-none"
            />
            {wordCount > 0 && (
              <span className="absolute bottom-2 right-3 text-[10px] tracking-wide text-zinc-600">
                {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}
              </span>
            )}
          </div>
        )}

        {/* Erro */}
        {genError && (
          <div className="bg-red-500/5 border border-red-500/20 p-4 mb-4">
            <p className="text-xs text-red-400">✗ {genError}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleGenerateClick}
          disabled={loading === 'ideas' || loading === 'slides'}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gold hover:bg-gold-soft disabled:opacity-50 text-ink font-bold py-3.5 px-8 text-xs tracking-[0.2em] uppercase transition-colors"
        >
          {loading === 'ideas' || loading === 'slides' ? (
            <><div className="h-3.5 w-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Gerando…</>
          ) : config.suggestionMode === 'literal' ? (
            <><Sparkles className="h-4 w-4" /> Estruturar em slides</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Sugerir ideias</>
          )}
        </button>

        <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-600 mt-4">
          Pode levar até 30 segundos
        </p>
      </div>
    </div>
  )
}

function ConfigPanel({
  config, setConfig, pilars,
}: {
  config: Config
  setConfig: (c: Config) => void
  pilars: string[]
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
    <div className="w-full md:w-60 flex-shrink-0 md:border-r border-b md:border-b-0 border-zinc-800 flex flex-col">
      <div className="p-4 flex-1 space-y-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Configurações</p>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Pilar</label>
          <div className="flex items-center gap-1">
            <select
              value={config.pilar}
              onChange={e => set('pilar')(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-gold/50"
            >
              {activePilars.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setEditingPilars(o => !o)}
              className={cn('p-1.5 rounded-lg transition-colors', editingPilars ? 'text-gold bg-gold/10' : 'text-zinc-500 hover:text-zinc-300')}
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
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-gold/50"
          >
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Formato de Conteúdo</label>
          <select
            value={config.format}
            onChange={e => set('format')(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-gold/50"
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
                    ? 'bg-gold border-gold text-ink'
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
                    ? 'bg-gold border-gold text-ink font-medium'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                )}
              >
                {f === 'feed' ? '⊞ Feed' : f === 'story' ? '▯ Story' : '▷ Reels'}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Idea Grid ────────────────────────────────────────────────────────────────

function IdeaGrid({
  ideas, onSelect, loading, genError, onRetry,
}: {
  ideas: Idea[]
  onSelect: (idea: Idea) => void
  loading: LoadingState
  genError?: string | null
  onRetry?: () => void
}) {
  if (loading === 'ideas') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <ProgressiveLoader
          steps={[
            'Lendo o DNA da sua marca…',
            'Aplicando as 5 fórmulas virais…',
            'Refinando ângulos e ganchos…',
          ]}
          subtitle="Pode levar até 30 segundos"
        />
      </div>
    )
  }

  if (genError) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4 bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-sm text-red-400 font-medium leading-relaxed">{genError}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2 text-xs tracking-[0.2em] uppercase font-semibold transition-colors"
            >
              Tentar novamente
            </button>
          )}
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Escolha uma Ideia</p>
        <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600">
          5 fórmulas virais aplicadas
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {ideas.map((idea, i) => {
          const label = idea.formula ? FORMULA_LABELS[idea.formula] : null
          return (
            <button
              key={i}
              onClick={() => onSelect(idea)}
              className="relative text-left bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-gold rounded-xl p-4 transition-all group"
            >
              {label && (
                <span className="absolute top-3 right-3 text-[9px] tracking-[0.2em] uppercase text-gold border border-gold/40 px-2 py-0.5 font-semibold">
                  {label}
                </span>
              )}
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 group-hover:text-gold transition-colors">
                Ideia {i + 1}
              </p>
              <p className="text-white font-semibold text-sm leading-snug mb-2">{idea.title}</p>
              <p className="text-zinc-400 text-xs leading-relaxed">{idea.subtitle}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const FORMULA_LABELS: Record<string, string> = {
  atalho:   'Atalho',
  guia:     'Guia',
  conselho: 'Conselho',
  case:     'Case',
  marco:    'Marco',
}

// ─── Slide Preview ────────────────────────────────────────────────────────────

function SlidePreview({
  idea, slides, setSlides, caption, setCaption, loading, config, workspace, savedPautaId, setSavedPautaId, onBack, onApprove, onCopyCaption,
}: {
  idea: Idea
  slides: Slide[]
  setSlides: (slides: Slide[]) => void
  caption: string
  setCaption: (c: string) => void
  loading: LoadingState
  config: Config
  workspace: Workspace
  savedPautaId: string | null
  setSavedPautaId: (id: string | null) => void
  onBack: () => void
  onApprove: () => void
  onCopyCaption: () => void
}) {
  const [editingSlide, setEditingSlide] = useState<number | null>(null)
  const [editingCaption, setEditingCaption] = useState(false)

  function updateSlide(n: number, patch: Partial<Slide>) {
    setSlides(slides.map(s => s.number === n ? { ...s, ...patch } : s))
  }
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
          description: idea.subtitle || caption?.split('\n')[0] || '',
          category: config.pilar,
          platform: plat,
          format: fmt,
          tags: idea.formula ? [idea.formula] : [],
          slides,
          caption,
          editor_state: {
            __suggestion: config.suggestion || null,
            __suggestion_mode: config.suggestionMode || 'hint',
            __news_sub_mode: config.newsSubMode || 'trends',
          },
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
      <div className="flex-1 flex items-center justify-center p-8">
        <ProgressiveLoader
          steps={[
            'Estruturando os slides…',
            'Aplicando a fórmula viral escolhida…',
            'Escrevendo legenda e CTA…',
            'Refinando textos e ênfases…',
          ]}
          subtitle="Pode levar até 30 segundos"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Selected idea header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white leading-snug">{idea.title}</h2>
        <p className="text-zinc-400 text-sm mt-1 italic border-l-2 border-gold pl-3">{idea.subtitle}</p>
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
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Slides</p>
          <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-600">Clique para editar</p>
        </div>
        <div className="space-y-2">
          {slides.map(slide => {
            const titleText = slide.title || slide.text || ''
            const titleParts = parseSlideParts(titleText)
            const isEditing = editingSlide === slide.number

            return (
              <div
                key={slide.number}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all',
                  isEditing
                    ? 'bg-zinc-800 border border-gold/30'
                    : 'bg-zinc-800/40 hover:bg-zinc-800/70 cursor-pointer border border-transparent'
                )}
                onClick={() => !isEditing && setEditingSlide(slide.number)}
              >
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest w-12 flex-shrink-0 pt-0.5">
                  {String(slide.number).padStart(2, '0')}
                </span>

                {isEditing ? (
                  <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <label className="text-[9px] text-zinc-500 tracking-widest uppercase">Título</label>
                      <input
                        type="text"
                        value={titleText}
                        onChange={e => updateSlide(slide.number, { title: e.target.value, text: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-gold/50 mt-0.5"
                        placeholder="Texto principal · use _palavra_ para destaque dourado"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 tracking-widest uppercase">Subtítulo</label>
                      <textarea
                        value={slide.subtitle || ''}
                        onChange={e => updateSlide(slide.number, { subtitle: e.target.value })}
                        rows={2}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-gold/50 resize-none mt-0.5"
                        placeholder="Explicação (opcional)"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 tracking-widest uppercase">Callout</label>
                      <input
                        type="text"
                        value={slide.callout || ''}
                        onChange={e => updateSlide(slide.number, { callout: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-gold font-semibold focus:outline-none focus:border-gold/50 mt-0.5"
                        placeholder="Frase curta de destaque (opcional)"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingSlide(null)}
                        className="text-[10px] tracking-widest uppercase text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
                      >
                        Fechar
                      </button>
                      <button
                        onClick={() => setEditingSlide(null)}
                        className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase bg-gold text-ink px-3 py-1.5 font-semibold hover:bg-gold-soft transition-colors"
                      >
                        <Check className="h-3 w-3" /> OK
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-zinc-200 leading-snug font-medium">
                        {titleParts.map((part, i) =>
                          part.emphasis
                            ? <span key={i} className="text-gold">{part.text}</span>
                            : <span key={i}>{part.text}</span>
                        )}
                      </p>
                      {slide.subtitle && (
                        <p className="text-xs text-zinc-500 leading-relaxed italic">{slide.subtitle}</p>
                      )}
                      {slide.callout && (
                        <p className="text-xs text-gold font-semibold">→ {slide.callout}</p>
                      )}
                    </div>
                    <Edit2 className="h-3 w-3 text-zinc-600 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Caption */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            Legenda {config.platform}
          </p>
          <div className="flex items-center gap-3">
            {!editingCaption && (
              <button
                onClick={() => setEditingCaption(true)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Edit2 className="h-3 w-3" /> Editar
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {copied ? <><Check className="h-3 w-3 text-green-400" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar</>}
            </button>
          </div>
        </div>
        {editingCaption ? (
          <div className="space-y-2">
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              rows={Math.min(20, Math.max(6, caption.split('\n').length + 1))}
              className="w-full bg-zinc-900 border border-gold/30 rounded-lg p-3 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-gold/60 resize-none font-mono"
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={() => setEditingCaption(false)}
                className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase bg-gold text-ink px-3 py-1.5 font-semibold hover:bg-gold-soft transition-colors"
              >
                <Check className="h-3 w-3" /> OK
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditingCaption(true)}
            className="bg-zinc-800/40 hover:bg-zinc-800/70 cursor-pointer rounded-lg p-3 text-xs text-zinc-300 whitespace-pre-line leading-relaxed border border-transparent hover:border-zinc-700 transition-all"
          >
            {caption || <span className="text-zinc-600 italic">Clique para escrever uma legenda...</span>}
          </div>
        )}
      </div>

      {/* Salvar como pauta */}
      <div className="pb-4">
        {saveError && (
          <p className="text-xs text-red-400 mb-2">✗ {saveError}</p>
        )}
        <button
          onClick={handleSavePauta}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-gold text-white py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
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

export function GenerateFlow({ workspace, brandDna, pilars, initialPauta }: Props) {
  const defaultPilar = pilars[0] || brandDna?.step5_content_pillars?.[0] || 'Estratégia'

  // Capitaliza primeira letra (DB salva lowercase, mas UI usa capitalizado)
  const cap = (s: string | undefined) => s ? s[0].toUpperCase() + s.slice(1) : ''

  const hasSavedSlides = !!(initialPauta?.slides && Array.isArray(initialPauta.slides) && initialPauta.slides.length > 0)

  const [step, setStep] = useState<Step>(hasSavedSlides ? 'arte' : 'texto')
  const [loading, setLoading] = useState<LoadingState>(null)
  const [config, setConfig] = useState<Config>({
    pilar: initialPauta?.category || defaultPilar,
    platform: cap(initialPauta?.platform?.[0]) || 'Instagram',
    format: cap(initialPauta?.format) || 'Carrossel',
    variant: 'dark',
    publicationFormat: 'feed',
    suggestion: initialPauta?.editor_state?.__suggestion || '',
    suggestionMode: (initialPauta?.editor_state?.__suggestion_mode as SuggestionMode) || 'hint',
    newsSubMode: (initialPauta?.editor_state?.__news_sub_mode as NewsSubMode) || 'trends',
  })
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(
    initialPauta?.title
      ? { title: initialPauta.title, subtitle: initialPauta.description || '' }
      : null
  )
  const [slides, setSlides] = useState<Slide[]>(initialPauta?.slides || [])
  const [caption, setCaption] = useState<string>(initialPauta?.caption || initialPauta?.description || '')
  const [savedPautaId, setSavedPautaId] = useState<string | null>(initialPauta?.id || null)
  const [genError, setGenError] = useState<string | null>(null)

  async function handleGenerateIdeas() {
    // Modo literal pula a etapa de ideias e vai direto pra slides
    if (config.suggestionMode === 'literal') {
      if (!config.suggestion.trim()) {
        setGenError('Cole o texto que será estruturado em slides.')
        return
      }
      // Primeira linha do texto vira "título" da ideia, resto é o subtítulo
      const lines = config.suggestion.trim().split('\n').filter(Boolean)
      const title = lines[0]?.slice(0, 120) || 'Conteúdo estruturado'
      const subtitle = lines.slice(1).join(' ').slice(0, 200) || ''
      return handleSelectIdea({ title, subtitle })
    }

    setLoading('ideas')
    setIdeas([])
    setSelectedIdea(null)
    setSlides([])
    setCaption('')
    setSavedPautaId(null)
    setGenError(null)

    try {
      // Sub-modo "trends" do Notícia ativa web search real-time
      const isTrends = config.suggestionMode === 'news' && config.newsSubMode === 'trends'

      // Constrói prompt sintético se for trends (sem race condition do setConfig)
      const effectiveSuggestion = isTrends
        ? (config.suggestion.trim()
            ? `Comente as tendências, debates e notícias atuais mais relevantes sobre "${config.pilar}". Foco adicional: ${config.suggestion.trim()}`
            : `Comente as tendências, debates e notícias atuais mais relevantes sobre "${config.pilar}".`)
        : (config.suggestion || undefined)

      const res = await fetch('/api/generate/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspace.id,
          pilar: config.pilar,
          platform: config.platform,
          format: config.format,
          suggestion: effectiveSuggestion,
          suggestion_mode: config.suggestionMode,
          use_web_search: isTrends,
          brand_dna: brandDna,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.hint ? `${data.error} ${data.hint}` : (data.error || 'Erro ao gerar ideias'))
      setIdeas(data.ideas || [])
    } catch (err: any) {
      setGenError(err.message || 'Erro inesperado ao gerar ideias.')
    } finally {
      setLoading(null)
    }
  }

  async function handleSelectIdea(idea: Idea) {
    setSelectedIdea(idea)
    setLoading('slides')
    setSlides([])
    setCaption('')
    setSavedPautaId(null)
    setGenError(null)

    try {
      const isTrends = config.suggestionMode === 'news' && config.newsSubMode === 'trends'

      const effectiveSuggestion = isTrends
        ? (config.suggestion.trim()
            ? `Comente as tendências, debates e notícias atuais mais relevantes sobre "${config.pilar}". Foco adicional: ${config.suggestion.trim()}`
            : `Comente as tendências, debates e notícias atuais mais relevantes sobre "${config.pilar}".`)
        : (config.suggestion || undefined)

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
          formula: idea.formula,
          suggestion: effectiveSuggestion,
          suggestion_mode: config.suggestionMode,
          use_web_search: isTrends,
          brand_dna: brandDna,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.hint ? `${data.error} ${data.hint}` : (data.error || 'Erro ao gerar slides'))
      setSlides(data.slides || [])
      setCaption(data.caption || '')
    } catch (err: any) {
      setGenError(err.message || 'Erro inesperado ao gerar slides.')
      setSelectedIdea(null)
    } finally {
      setLoading(null)
    }
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
          <UsageBadge workspaceId={workspace.id} refreshKey={slides.length} />
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
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <ConfigPanel
            config={config}
            setConfig={setConfig}
            pilars={
              pilars.length > 0 ? pilars
              : (brandDna?.step5_content_pillars?.length ?? 0) > 0 ? brandDna!.step5_content_pillars!
              : ['Estratégia', 'Cases', 'Educação', 'Bastidores', 'Tendências']
            }
          />

          {showSlides ? (
            <SlidePreview
              idea={selectedIdea!}
              slides={slides}
              setSlides={setSlides}
              caption={caption}
              setCaption={setCaption}
              loading={loading}
              config={config}
              workspace={workspace}
              savedPautaId={savedPautaId}
              setSavedPautaId={setSavedPautaId}
              onBack={handleBack}
              onApprove={() => setStep('arte')}
              onCopyCaption={() => navigator.clipboard.writeText(caption)}
            />
          ) : ideas.length > 0 || loading === 'ideas' || genError ? (
            <IdeaGrid
              ideas={ideas}
              onSelect={handleSelectIdea}
              loading={loading}
              genError={genError}
              onRetry={handleGenerateIdeas}
            />
          ) : (
            <ContentBaseHero
              config={config}
              setConfig={setConfig}
              onGenerate={handleGenerateIdeas}
              loading={loading}
              genError={genError}
            />
          )}
        </div>
      ) : (
        <ArtCanvas
          slides={slides}
          setSlides={setSlides}
          caption={caption}
          idea={selectedIdea!}
          config={config}
          brandDna={brandDna}
          workspace={workspace}
          savedPautaId={savedPautaId}
          setSavedPautaId={setSavedPautaId}
          initialEditorState={initialPauta?.editor_state || null}
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
            className="flex items-center gap-2 bg-gold hover:bg-gold-soft text-ink font-bold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Aprovar e Gerar Arte →
          </button>
        ) : step === 'arte' ? (
          <button
            onClick={() => setStep('texto')}
            className="group flex items-center gap-2 border border-gold/40 hover:border-gold bg-gold/5 hover:bg-gold/15 text-gold px-5 py-2.5 text-xs tracking-[0.2em] uppercase font-bold transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao texto
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
