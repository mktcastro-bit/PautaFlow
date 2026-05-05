'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Download, Upload, Trash2, Edit, Zap, Calendar } from 'lucide-react'
import { Pauta, Workspace, PautaFilters, PautaStatus } from '@/types'
import {
  STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS,
  PLATFORM_LABELS, FORMAT_LABELS, formatDate, cn
} from '@/lib/utils'
import { PautaModal } from './pauta-modal'
import { createClient } from '@/lib/supabase/client'

interface Props {
  pautas: Pauta[]
  workspace: Workspace
  categories: string[]
  filters: { [key: string]: string | undefined }
}

export function PautasClient({ pautas, workspace, categories, filters }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editingPauta, setEditingPauta] = useState<Pauta | null>(null)
  const [showFilters, setShowFilters] = useState(false)
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
    router.push('?')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilter('search', search || undefined)
  }

  async function handleDelete(pautaId: string) {
    if (!confirm('Tem certeza que deseja excluir esta pauta?')) return
    const supabase = createClient()
    await supabase.from('pautas').delete().eq('id', pautaId)
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

  const hasFilters = Object.values(filters).some(Boolean)
  const statusOptions: PautaStatus[] = ['ideia', 'em_desenvolvimento', 'aprovado', 'publicado', 'arquivado']

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Repositório de Pautas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {pautas.length} pauta{pautas.length !== 1 ? 's' : ''} encontrada{pautas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            <span className="flex items-center gap-1.5 px-3 py-2 border border-input rounded-lg text-sm hover:bg-accent transition-colors">
              <Upload className="h-3.5 w-3.5" />
              Importar
            </span>
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 border border-input rounded-lg text-sm hover:bg-accent transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
          <button
            onClick={() => { setEditingPauta(null); setShowModal(true) }}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova pauta
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar pautas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Buscar
          </button>
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors',
            hasFilters ? 'border-primary text-primary bg-primary/5' : 'border-input hover:bg-accent'
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Filtros
          {hasFilters && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Limpar
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={filters.status || ''}
              onChange={e => applyFilter('status', e.target.value || undefined)}
              className="w-full px-2 py-1.5 border border-input rounded-md text-sm"
            >
              <option value="">Todos</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Categoria</label>
            <select
              value={filters.category || ''}
              onChange={e => applyFilter('category', e.target.value || undefined)}
              className="w-full px-2 py-1.5 border border-input rounded-md text-sm"
            >
              <option value="">Todas</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Plataforma</label>
            <select
              value={filters.platform || ''}
              onChange={e => applyFilter('platform', e.target.value || undefined)}
              className="w-full px-2 py-1.5 border border-input rounded-md text-sm"
            >
              <option value="">Todas</option>
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Prioridade</label>
            <select
              value={filters.priority || ''}
              onChange={e => applyFilter('priority', e.target.value || undefined)}
              className="w-full px-2 py-1.5 border border-input rounded-md text-sm"
            >
              <option value="">Todas</option>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {pautas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
            <Search className="h-6 w-6" />
          </div>
          <p className="font-medium">Nenhuma pauta encontrada</p>
          <p className="text-sm mt-1">Crie sua primeira pauta ou ajuste os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

function PautaCard({
  pauta, workspaceSlug, onEdit, onDelete
}: {
  pauta: Pauta
  workspaceSlug: string
  onEdit: () => void
  onDelete: () => void
}) {
  const router = useRouter()

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[pauta.status])}>
            {STATUS_LABELS[pauta.status]}
          </span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PRIORITY_COLORS[pauta.priority])}>
            {PRIORITY_LABELS[pauta.priority]}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{pauta.title}</h3>
      {pauta.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pauta.description}</p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {pauta.platform.map(p => (
          <span key={p} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {PLATFORM_LABELS[p] || p}
          </span>
        ))}
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          {FORMAT_LABELS[pauta.format] || pauta.format}
        </span>
      </div>

      {pauta.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {pauta.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-primary/70">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        {pauta.scheduled_date && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(pauta.scheduled_date)}
          </span>
        )}
        <button
          onClick={() => router.push(`/workspaces/${workspaceSlug}/generate?pauta_id=${pauta.id}`)}
          className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Zap className="h-3 w-3" />
          Gerar conteúdo
        </button>
      </div>
    </div>
  )
}
