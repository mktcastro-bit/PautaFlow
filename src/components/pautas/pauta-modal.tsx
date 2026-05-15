'use client'

import { useState, useRef } from 'react'
import { X, Upload, Image as ImageIcon, Film, Loader2, AlertCircle } from 'lucide-react'
import { Pauta, Workspace, PautaStatus, PautaFormat, PautaPriority, MediaItem } from '@/types'
import { PLATFORM_LABELS, FORMAT_LABELS, STATUS_LABELS, PRIORITY_LABELS, cn } from '@/lib/utils'

interface Props {
  workspace: Workspace
  pauta?: Pauta | null
  onClose: () => void
  onSave: () => void
}

const CATEGORIES = [
  'Marketing', 'Vendas', 'Educacional', 'Institucional',
  'Entretenimento', 'Bastidores', 'Cases', 'Tendências', 'Geral',
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
  const [media, setMedia] = useState<MediaItem[]>(pauta?.media || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function togglePlatform(p: string) {
    setForm(prev => ({
      ...prev,
      platform: prev.platform.includes(p)
        ? prev.platform.filter(x => x !== p)
        : [...prev.platform, p],
    }))
  }

  async function uploadFile(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('workspace_id', workspace.id)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (!res.ok) throw new Error(json.hint ? `${json.error} ${json.hint}` : (json.error || 'Erro no upload'))
    return json.media as MediaItem
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError(null)
    setUploading(true)
    try {
      const items: MediaItem[] = []
      for (const file of Array.from(files)) {
        const item = await uploadFile(file)
        items.push(item)
      }
      setMedia(prev => [...prev, ...items])
    } catch (e: any) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeMedia(index: number) {
    setMedia(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...(pauta ? { id: pauta.id } : { workspace_id: workspace.id }),
        title: form.title,
        description: form.description || null,
        category: form.category,
        platform: form.platform,
        format: form.format,
        status: form.status,
        priority: form.priority,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        scheduled_date: form.scheduled_date || null,
        media,
      }
      const res = await fetch('/api/pautas', {
        method: pauta ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      onSave()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-2xl max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">
              {pauta ? 'Editar' : 'Nova publicação'}
            </p>
            <h2 className="font-serif text-xl mt-0.5">
              {pauta ? 'Pauta' : 'Novo post manual'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* ── Upload de mídia ──────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">
              Mídia do post
            </label>
            <p className="text-[10px] text-muted-foreground/70 -mt-1">
              Faça upload das imagens/vídeos que compõem essa pauta.
              Imagens até 5MB · Vídeos até 20MB.
            </p>

            {/* Grid de previews */}
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {media.map((item, i) => (
                  <div key={i} className="relative aspect-square bg-zinc-800 border border-border overflow-hidden group">
                    {item.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                        <Film className="h-6 w-6 mb-1" />
                        <span className="text-[9px] tracking-wide truncate max-w-[80%]">{item.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
                      <p className="text-[9px] text-zinc-300 truncate">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone / botão de upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={cn(
                'w-full flex items-center justify-center gap-2 border-2 border-dashed py-6 transition-colors',
                uploading ? 'border-gold/40 bg-gold/5' : 'border-border hover:border-gold/40 hover:bg-gold/[0.02]'
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  <span className="text-xs tracking-luxe uppercase text-gold">Enviando…</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs tracking-luxe uppercase text-muted-foreground">
                    {media.length === 0 ? 'Adicionar imagens / vídeos' : 'Adicionar mais'}
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              onChange={e => handleFiles(e.target.files)}
              className="hidden"
            />

            {uploadError && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* ── Dados da pauta ───────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Título *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ex: Lançamento da campanha de inverno"
              className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Descrição / Briefing</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Texto da legenda, contexto da peça, instruções de copy…"
              rows={3}
              className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Formato</label>
              <select
                value={form.format}
                onChange={e => setForm(p => ({ ...p, format: e.target.value as PautaFormat }))}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              >
                {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Plataformas</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => togglePlatform(k)}
                  className={cn(
                    'px-3 py-1.5 text-[10px] tracking-luxe uppercase border transition-colors',
                    form.platform.includes(k)
                      ? 'bg-gold/10 border-gold/50 text-gold'
                      : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as PautaStatus }))}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Prioridade</label>
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as PautaPriority }))}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="ia, marketing, conteúdo (separar por vírgula)"
              className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] tracking-luxe uppercase text-muted-foreground font-semibold">Data de publicação</label>
            <input
              type="date"
              value={form.scheduled_date}
              onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))}
              className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[10px] tracking-luxe uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.title.trim() || uploading}
            className="flex items-center gap-1.5 bg-gold text-ink px-5 py-2.5 text-[10px] tracking-luxe uppercase font-semibold hover:bg-gold-soft transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {loading ? 'Salvando' : pauta ? 'Salvar alterações' : 'Criar pauta'}
          </button>
        </div>
      </div>
    </div>
  )
}
