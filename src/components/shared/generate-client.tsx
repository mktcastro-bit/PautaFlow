'use client'

import { useState } from 'react'
import { Zap, Copy, Check, Clock, Dna, AlertCircle } from 'lucide-react'
import { Workspace, GeneratedContent, PautaFormat } from '@/types'
import { PLATFORM_LABELS, FORMAT_LABELS, formatDateTime, cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  workspace: Workspace
  pautas: Array<{ id: string; title: string; description: string | null; platform: string[]; format: string }>
  history: GeneratedContent[]
  hasBrandDna: boolean
  selectedPautaId?: string
}

export function GenerateClient({ workspace, pautas, history, hasBrandDna, selectedPautaId }: Props) {
  const [form, setForm] = useState({
    pauta_id: selectedPautaId || '',
    pauta_title: '',
    pauta_description: '',
    platform: 'instagram',
    format: 'post' as PautaFormat,
    custom_instructions: '',
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const selectedPauta = pautas.find(p => p.id === form.pauta_id)

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setResult(null)

    const payload = {
      workspace_id: workspace.id,
      ...(form.pauta_id
        ? { pauta_id: form.pauta_id }
        : { pauta_title: form.pauta_title, pauta_description: form.pauta_description }),
      platform: form.platform,
      format: form.format,
      custom_instructions: form.custom_instructions || undefined,
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erro ao gerar conteúdo')
    } else {
      setResult(data.content)
    }

    setGenerating(false)
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gerador de Conteúdo</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gere conteúdo personalizado com IA baseado no DNA da sua marca.
        </p>
      </div>

      {!hasBrandDna && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium text-amber-800">DNA da Marca não configurado.</span>
            <span className="text-amber-700"> Configure o DNA para gerar conteúdo personalizado à sua marca.</span>
          </div>
          <Link
            href={`/workspaces/${workspace.slug}/brand-dna`}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Dna className="h-3.5 w-3.5" />
            Configurar
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config panel */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm">Configuração</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pauta (opcional)</label>
              <select
                value={form.pauta_id}
                onChange={e => setForm(p => ({ ...p, pauta_id: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Sem pauta (inserir título) —</option>
                {pautas.map(pauta => (
                  <option key={pauta.id} value={pauta.id}>{pauta.title}</option>
                ))}
              </select>
            </div>

            {!form.pauta_id && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Título do conteúdo *</label>
                  <input
                    type="text"
                    value={form.pauta_title}
                    onChange={e => setForm(p => ({ ...p, pauta_title: e.target.value }))}
                    placeholder="Ex: 5 tendências de IA para 2025"
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Contexto / Descrição</label>
                  <textarea
                    value={form.pauta_description}
                    onChange={e => setForm(p => ({ ...p, pauta_description: e.target.value }))}
                    placeholder="Descreva o contexto, pontos principais, ângulo..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Plataforma</label>
                <select
                  value={form.platform}
                  onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Formato</label>
                <select
                  value={form.format}
                  onChange={e => setForm(p => ({ ...p, format: e.target.value as PautaFormat }))}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Instruções adicionais</label>
              <textarea
                value={form.custom_instructions}
                onChange={e => setForm(p => ({ ...p, custom_instructions: e.target.value }))}
                placeholder="Ex: Mencionar o lançamento do produto X, usar o case do cliente Y..."
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || (!form.pauta_id && !form.pauta_title.trim())}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Gerar conteúdo
                </>
              )}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Histórico recente
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 8).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setResult(item.content)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-accent transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-muted-foreground">
                        {PLATFORM_LABELS[item.platform || ''] || item.platform} · {FORMAT_LABELS[item.format || ''] || item.format}
                      </span>
                      <span className="text-muted-foreground">{formatDateTime(item.created_at)}</span>
                    </div>
                    <p className="text-foreground line-clamp-2">{item.content}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result panel */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Conteúdo gerado</h2>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-input rounded-lg hover:bg-accent transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {result ? (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/30 rounded-lg p-4 overflow-y-auto max-h-[500px]">
                {result}
              </pre>
            </div>
          ) : (
            <div className={cn(
              'flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground',
              generating && 'animate-pulse'
            )}>
              <Zap className={cn('h-10 w-10 mb-3 text-muted-foreground/50', generating && 'text-primary/50')} />
              <p className="text-sm font-medium">
                {generating ? 'Gerando seu conteúdo...' : 'Configure e clique em "Gerar conteúdo"'}
              </p>
              {!generating && (
                <p className="text-xs mt-1 text-muted-foreground/70">
                  O conteúdo será gerado com base no DNA da marca
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
