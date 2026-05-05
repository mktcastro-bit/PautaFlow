'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Pauta, Workspace, PautaStatus, PautaFormat, PautaPriority } from '@/types'
import { PLATFORM_LABELS, FORMAT_LABELS, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Props {
  workspace: Workspace
  pauta?: Pauta | null
  onClose: () => void
  onSave: () => void
}

const CATEGORIES = [
  'Marketing', 'Vendas', 'Educacional', 'Institucional',
  'Entretenimento', 'Bastidores', 'Cases', 'Tendências', 'Geral'
]

export function PautaModal({ workspace, pauta, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    title: pauta?.title || '',
    description: pauta?.description || '',
    category: pauta?.category || 'Geral',
    platform: pauta?.platform || ['instagram'],
    format: pauta?.format || 'post' as PautaFormat,
    status: pauta?.status || 'ideia' as PautaStatus,
    priority: pauta?.priority || 'media' as PautaPriority,
    tags: pauta?.tags?.join(', ') || '',
    scheduled_date: pauta?.scheduled_date || '',
  })
  const [loading, setLoading] = useState(false)

  function togglePlatform(p: string) {
    setForm(prev => ({
      ...prev,
      platform: prev.platform.includes(p)
        ? prev.platform.filter(x => x !== p)
        : [...prev.platform, p]
    }))
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setLoading(true)

    const supabase = createClient()
    const payload = {
      workspace_id: workspace.id,
      title: form.title,
      description: form.description || null,
      category: form.category,
      platform: form.platform,
      format: form.format,
      status: form.status,
      priority: form.priority,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      scheduled_date: form.scheduled_date || null,
    }

    if (pauta) {
      await supabase.from('pautas').update(payload).eq('id', pauta.id)
    } else {
      await supabase.from('pautas').insert(payload)
    }

    setLoading(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold">{pauta ? 'Editar pauta' : 'Nova pauta'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ex: Como usar IA no marketing de conteúdo"
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descrição / Briefing</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descreva o objetivo, referências, pontos principais..."
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Formato</label>
              <select
                value={form.format}
                onChange={e => setForm(p => ({ ...p, format: e.target.value as PautaFormat }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Plataformas</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => togglePlatform(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.platform.includes(k)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as PautaStatus }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Prioridade</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as PautaPriority }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="ia, marketing, conteúdo (separar por vírgula)"
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Data de publicação</label>
            <input
              type="date"
              value={form.scheduled_date}
              onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-input hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.title.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : pauta ? 'Salvar alterações' : 'Criar pauta'}
          </button>
        </div>
      </div>
    </div>
  )
}
