'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Download, Upload, Trash2, Edit, Zap, Calendar, X, Sparkles } from 'lucide-react'
import { Pauta, Workspace, PautaStatus } from '@/types'
import {
  STATUS_LABELS, PLATFORM_LABELS, FORMAT_LABELS, formatDate, cn
} from '@/lib/utils'
import { PautaModal } from './pauta-modal'
import { createClient } from '@/lib/supabase/client'
import { DnaIncompleteBanner } from '@/components/shared/dna-incomplete-banner'

interface Props {
  pautas: Pauta[]
  workspace: Workspace
  categories: string[]
  filters: { [key: string]: string | undefined }
  dnaIncomplete?: boolean
}

const PLATFORMS = ['instagram', 'linkedin', 'ambos'] as const
const FORMATS = ['carrossel', 'post', 'artigo', 'reels'] as const

export function PautasClient({ pautas, workspace, categories, filters, dnaIncomplete }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editingPauta, setEditingPauta] = useState<Pauta | null>(null)
  const [search, setSearch] = useState(filters.search || '')

  function applyFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams()
    const current = { ...filters, [key]: value }
    Object.entries(current).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    router.push(`?${params.toString()}`)
  }

  function clearFilters() {
    setSearch('')
    router.push('?')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilter('search', search || undefined)
  }

  async function handleDelete(pautaId: string) {
    if (!confirm('Tem certeza que deseja excluir esta pauta?')) return
    await fetch(`/api/pautas?id=${pautaId}`, { method: 'DELETE' })
    router.refresh()
  }

  async function handleExport() {
    const params = new URLSearchParams({ workspace_id: workspace.id })
    const res = await fetch(`/api/export?${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pautas-${workspace.slug}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const data = JSON.parse(text)
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: workspace.id, data }),
    })
    if (res.ok) router.refresh()
  }

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = {
    total: pautas.length,
    ideia: pautas.filter(p => p.status === 'ideia').length,
    producao: pautas.filter(p => p.status === 'em_desenvolvimento').length,
    publicado: pautas.filter(p => p.status === 'publicado').length,
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="min-h-screen bg-background">

      {/* DNA pendente */}
      {dnaIncomplete && <DnaIncompleteBanner workspaceSlug={workspace.slug} variant="sticky" />}

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 lg:top-0 z-20">
        <div className="px-4 lg:px-8 py-4 lg:py-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] text-muted-foreground tracking-luxe uppercase">
              {workspace.name}
            </p>
            <h1 className="font-serif text-2xl tracking-tight mt-0.5">
              Repositório de <span className="text-gold italic">Pautas</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs tracking-wide uppercase text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all">
                <Upload className="h-3 w-3" /> Importar
              </span>
            </label>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs tracking-wide uppercase text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all"
            >
              <Download className="h-3 w-3" /> Exportar
            </button>
            <button
              onClick={() => { setEditingPauta(null); setShowModal(true) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs tracking-wide uppercase border border-border hover:border-gold/40 hover:text-gold transition-all"
            >
              <Plus className="h-3 w-3" /> Nova Pauta
            </button>
            <button
              onClick={() => router.push(`/workspaces/${workspace.slug}/generate`)}
              className="group relative flex items-center gap-2 bg-gold text-ink px-5 py-2.5 text-xs tracking-[0.2em] uppercase font-bold hover:bg-gold-soft transition-all shadow-lg shadow-gold/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Gerar conteúdo
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-gold rounded-full animate-ping opacity-60" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-gold rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-border pb-8">
          <Stat n={stats.total}     label="Total" />
          <Stat n={stats.ideia}     label="Ideias" />
          <Stat n={stats.producao}  label="Em Produção" />
          <Stat n={stats.publicado} label="Publicadas" />
        </section>

        {/* ── Filters + Search row ──────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-x-10 gap-y-4 items-start">
          {/* Left column: filter rows */}
          <div className="space-y-4 min-w-0">
            <FilterRow label="Status" current={filters.status} onChange={v => applyFilter('status', v)}
              options={[
                { value: undefined, label: 'Todos' },
                { value: 'ideia', label: STATUS_LABELS.ideia },
                { value: 'em_desenvolvimento', label: 'Em Produção' },
                { value: 'publicado', label: STATUS_LABELS.publicado },
              ]}
            />
            {categories.length > 0 && (
              <FilterRow label="Pilar" current={filters.category} onChange={v => applyFilter('category', v)}
                options={[
                  { value: undefined, label: 'Todos' },
                  ...categories.map(c => ({ value: c, label: c })),
                ]}
              />
            )}
            <FilterRow label="Rede Social" current={filters.platform} onChange={v => applyFilter('platform', v)}
              options={[
                { value: undefined, label: 'Todas' },
                ...PLATFORMS.map(p => ({ value: p, label: PLATFORM_LABELS[p] || p })),
              ]}
            />
            <FilterRow label="Formato" current={filters.format} onChange={v => applyFilter('format', v)}
              options={[
                { value: undefined, label: 'Todos' },
                ...FORMATS.map(f => ({ value: f, label: FORMAT_LABELS[f] || f })),
              ]}
            />
          </div>

          {/* Right column: search + active filter summary */}
          <div className="space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar pelo título..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-card border border-border text-sm focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
            </form>

            {/* Active filters summary */}
            <div className="flex items-center justify-between text-[10px] tracking-luxe uppercase text-muted-foreground">
              <span>
                {pautas.length} {pautas.length === 1 ? 'pauta' : 'pautas'} {hasFilters && 'encontradas'}
              </span>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 hover:text-gold transition-colors"
                >
                  <X className="h-3 w-3" /> Limpar
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Cards grid ───────────────────────────────────────────────── */}
        {pautas.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="h-14 w-14 bg-card border border-border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-gold-dim" />
            </div>
            <p className="font-serif text-xl">Nenhuma pauta encontrada</p>
            <p className="text-sm mt-2">Crie sua primeira pauta ou ajuste os filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {pautas.map(pauta => (
              <PautaCard
                key={pauta.id}
                pauta={pauta}
                workspaceSlug={workspace.slug}
                onEdit={() => { setEditingPauta(pauta); setShowModal(true) }}
                onDelete={() => handleDelete(pauta.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PautaModal
          workspace={workspace}
          pauta={editingPauta}
          onClose={() => { setShowModal(false); setEditingPauta(null) }}
          onSave={() => { setShowModal(false); setEditingPauta(null); router.refresh() }}
        />
      )}
    </div>
  )
}

// ─── Stat ──────────────────────────────────────────────────────────────────
function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="font-serif text-5xl text-gold leading-none">{n}</div>
      <div className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</div>
    </div>
  )
}

// ─── FilterRow ─────────────────────────────────────────────────────────────
function FilterRow({
  label, current, options, onChange,
}: {
  label: string
  current: string | undefined
  options: Array<{ value: string | undefined; label: string }>
  onChange: (v: string | undefined) => void
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[10px] tracking-luxe uppercase text-muted-foreground w-20 flex-shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {options.map((opt, i) => {
          const active = current === opt.value || (current === undefined && opt.value === undefined)
          return (
            <button
              key={i}
              onClick={() => onChange(opt.value)}
              className={cn(
                'text-[10px] tracking-luxe uppercase px-3 py-1.5 rounded-md border transition-all',
                active
                  ? 'border-gold/50 text-gold bg-gold/5'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── PautaCard ─────────────────────────────────────────────────────────────
function PautaCard({
  pauta, workspaceSlug, onEdit, onDelete
}: {
  pauta: Pauta
  workspaceSlug: string
  onEdit: () => void
  onDelete: () => void
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)

  const statusBadge =
    pauta.status === 'publicado' ? { text: 'PUBLICADO', className: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' }
    : pauta.status === 'em_desenvolvimento' ? { text: 'PRODUÇÃO', className: 'border-gold/40 text-gold bg-gold/5' }
    : pauta.status === 'aprovado' ? { text: 'APROVADO', className: 'border-sky-500/30 text-sky-400 bg-sky-500/5' }
    : pauta.status === 'arquivado' ? { text: 'ARQUIVADO', className: 'border-zinc-500/30 text-zinc-400 bg-zinc-500/5' }
    : { text: 'IDEIA', className: 'border-zinc-500/30 text-zinc-400 bg-zinc-500/5' }

  function openPauta() {
    router.push(`/workspaces/${workspaceSlug}/generate?pauta_id=${pauta.id}`)
  }

  // Stops o click do card quando o usuário clica em botões de ação
  function stopProp(e: React.MouseEvent) { e.stopPropagation() }

  return (
    <div
      onClick={openPauta}
      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-gold/30 transition-all duration-300 flex flex-col cursor-pointer"
    >

      {/* Header art zone — preview da primeira mídia (ou placeholder se vazio) */}
      <div className="relative h-44 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-b border-border overflow-hidden">
        {/* Preview da primeira mídia (se houver) */}
        {pauta.media && pauta.media.length > 0 && pauta.media[0] && (
          <>
            {pauta.media[0].type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pauta.media[0].url}
                alt={pauta.media[0].name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <video
                src={pauta.media[0].url}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60" />
            {/* Contador se tiver mais de 1 mídia */}
            {pauta.media.length > 1 && (
              <span className="absolute top-3 right-3 text-[9px] tracking-luxe uppercase text-foreground bg-background/80 backdrop-blur-sm border border-border px-2 py-1 z-20">
                +{pauta.media.length - 1}
              </span>
            )}
          </>
        )}

        <div className="absolute inset-0 grain-overlay" />
        <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
          <div className="h-1 w-1 rounded-full bg-gold" />
          <span className="text-[10px] font-serif italic text-gold-soft">{pauta.category}</span>
        </div>
        {/* Hover overlay com indicador de ação */}
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 backdrop-blur-0 group-hover:backdrop-blur-[2px] transition-all flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] tracking-luxe uppercase text-gold border border-gold/40 px-3 py-1.5 bg-background/60">
            Abrir editor
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{pauta.title}</h3>
          <span className={cn(
            'text-[9px] tracking-luxe uppercase px-2 py-1 rounded-md border font-medium flex-shrink-0',
            statusBadge.className,
          )}>
            {statusBadge.text}
          </span>
        </div>

        {pauta.description && (
          <p className={cn(
            'text-xs text-muted-foreground italic border-l border-gold/30 pl-3 mb-4 leading-relaxed',
            expanded ? '' : 'line-clamp-2',
          )}>
            {pauta.description}
          </p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pauta.category && (
            <Tag>{pauta.category}</Tag>
          )}
          <Tag>{FORMAT_LABELS[pauta.format] || pauta.format}</Tag>
          {pauta.platform.map(p => (
            <Tag key={p}>{PLATFORM_LABELS[p] || p}</Tag>
          ))}
        </div>

        {/* "Ver mais" toggle */}
        {pauta.description && pauta.description.length > 100 && (
          <button
            onClick={(e) => { stopProp(e); setExpanded(o => !o) }}
            className="text-[10px] tracking-luxe uppercase text-gold hover:text-gold-soft self-start mb-2 transition-colors"
          >
            {expanded ? 'Ver menos ↑' : 'Ver mais ↓'}
          </button>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground tracking-wide uppercase">
            <Calendar className="h-3 w-3" />
            {pauta.scheduled_date ? formatDate(pauta.scheduled_date) : 'Sem data'}
          </span>
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { stopProp(e); onEdit() }}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Editar metadados"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { stopProp(e); onDelete() }}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] tracking-luxe uppercase px-2 py-1 rounded bg-secondary text-muted-foreground border border-border/60">
      {children}
    </span>
  )
}
