'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PALETTE = [
  '#c9a86a', '#94a3b8', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444',
]

export function NewWorkspaceClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [color, setColor] = useState(PALETTE[0])
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  // Auto-slug a partir do nome (se o usuário não tocou no slug)
  const [slugTouched, setSlugTouched] = useState(false)
  const autoSlug = name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const effectiveSlug = slugTouched ? slug : autoSlug

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true); setError(null); setHint(null)
    try {
      const res = await fetch('/api/workspaces/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: effectiveSlug,
          color,
          description: description.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Erro ao criar workspace')
        if (json.hint) setHint(json.hint)
        return
      }
      router.push(`/workspaces/${json.workspace.slug}/brand-dna?welcome=1`)
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Erro inesperado')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar minimal */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="px-4 lg:px-8 py-5 flex items-center justify-between">
          <Link
            href="/workspaces"
            className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Voltar
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gold" />
            <span className="text-[10px] tracking-luxe uppercase text-gold font-semibold">
              Nova marca
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight mb-4">
            Crie um <span className="italic text-gold">workspace</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-10">
            Cada workspace é uma marca separada com seu próprio DNA, pautas e calendário.
            Ideal para agências ou quem trabalha com várias marcas.
          </p>

          <div className="space-y-6">
            <Field label="Nome do workspace *" hint="Como você vai chamar essa marca/projeto aqui dentro.">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Cliente ACME · Marca Pessoal · Projeto X"
                className="w-full bg-card border border-border px-3 py-3 text-sm focus:outline-none focus:border-gold/50"
                autoFocus
              />
            </Field>

            <Field
              label="Slug (URL)"
              hint={`pauta-flow-one.vercel.app/workspaces/${effectiveSlug || 'seu-workspace'}/pautas`}
            >
              <input
                type="text"
                value={effectiveSlug}
                onChange={e => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')) }}
                placeholder="Auto-gerado a partir do nome"
                className="w-full bg-card border border-border px-3 py-3 text-sm font-mono focus:outline-none focus:border-gold/50"
              />
            </Field>

            <Field label="Cor identificadora">
              <div className="flex items-center gap-2 flex-wrap">
                {PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all',
                      color === c ? 'border-gold scale-110' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer bg-transparent border border-border"
                />
              </div>
            </Field>

            <Field label="Descrição" hint="Opcional — ajuda a equipe a lembrar do propósito.">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Ex: Marca pessoal de palestrante, foco em educação executiva."
                className="w-full bg-card border border-border px-3 py-3 text-sm focus:outline-none focus:border-gold/50 resize-none"
              />
            </Field>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 space-y-1">
                <p className="text-xs text-red-400 font-medium">✗ {error}</p>
                {hint && <p className="text-xs text-red-400/70">{hint}</p>}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="flex items-center gap-2 bg-gold text-ink px-6 py-3 text-xs tracking-luxe uppercase font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                {creating ? 'Criando' : 'Criar workspace'}
              </button>
              <Link
                href="/workspaces"
                className="text-xs tracking-luxe uppercase text-muted-foreground hover:text-foreground transition-colors px-4 py-3"
              >
                Cancelar
              </Link>
            </div>

            <p className="text-[10px] tracking-luxe uppercase text-muted-foreground/70 pt-2">
              Após criar, você vai direto configurar o DNA da marca.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] tracking-luxe uppercase text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}
