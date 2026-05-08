'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, Trash2, UserPlus, X, Crown, Shield, Edit3,
  Mail, Loader2, CheckCircle2, AlertTriangle, ExternalLink, Calendar
} from 'lucide-react'
import { Workspace, Organization } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  workspace: Workspace
  organization: Organization
}

interface Member {
  id: string
  user_id: string
  email: string
  role: string
  created_at: string
  is_self: boolean
}

const PALETTE = [
  '#c9a86a', // gold
  '#94a3b8', // slate
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
]

export function SettingsClient({ workspace, organization }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="px-8 py-5">
          <p className="text-[10px] text-muted-foreground tracking-luxe uppercase">
            {organization.name}
          </p>
          <h1 className="font-serif text-2xl tracking-tight mt-0.5">
            <span className="text-gold italic">Configurações</span>
          </h1>
        </div>
      </header>

      <div className="px-8 py-8 max-w-3xl space-y-10">
        <WorkspaceSection workspace={workspace} />
        <MembersSection organization={organization} />
        <PlanSection organization={organization} />
        <DangerSection workspace={workspace} />
      </div>
    </div>
  )
}

// ─── Workspace ─────────────────────────────────────────────────────────────
function WorkspaceSection({ workspace }: { workspace: Workspace }) {
  const router = useRouter()
  const [name, setName] = useState(workspace.name)
  const [slug, setSlug] = useState(workspace.slug)
  const [color, setColor] = useState(workspace.color || PALETTE[0])
  const [description, setDescription] = useState(workspace.description || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/workspaces/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workspace.id, name, slug, color, description }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro')
      setSaved(true); setTimeout(() => setSaved(false), 2500)
      // Se o slug mudou, a URL atual fica obsoleta — redireciona
      if (json.workspace?.slug && json.workspace.slug !== workspace.slug) {
        router.push(`/workspaces/${json.workspace.slug}/settings`)
      } else {
        router.refresh()
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section title="Workspace" subtitle="Identidade visual e endereço público.">
      <div className="space-y-5">
        <Field label="Nome">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-card border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
          />
        </Field>

        <Field label="Slug (URL)" hint={`pauta-flow-one.vercel.app/workspaces/${slug}/pautas`}>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="w-full bg-card border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-gold/50"
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

        <Field label="Descrição" hint="Opcional — uma frase que ajuda a equipe a lembrar do propósito.">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-card border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50 resize-none"
          />
        </Field>

        {error && <p className="text-xs text-red-400">✗ {error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-gold text-ink px-4 py-2 text-xs tracking-luxe uppercase font-semibold hover:bg-gold-soft transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Salvar
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Salvo
            </span>
          )}
        </div>
      </div>
    </Section>
  )
}

// ─── Members ───────────────────────────────────────────────────────────────
function MembersSection({ organization }: { organization: Organization }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState<string>('editor')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('editor')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  async function loadMembers() {
    setLoading(true)
    const res = await fetch(`/api/workspaces/members?organization_id=${organization.id}`)
    const json = await res.json()
    if (res.ok) {
      setMembers(json.members || [])
      setCurrentRole(json.current_role || 'editor')
    }
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [organization.id])

  async function invite() {
    if (!inviteEmail.trim()) return
    setInviting(true); setInviteMsg(null)
    try {
      const res = await fetch('/api/workspaces/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organization.id,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro')
      setInviteMsg({ type: 'ok', text: `Convite enviado para ${json.email}` })
      setInviteEmail('')
      loadMembers()
    } catch (e: any) {
      setInviteMsg({ type: 'error', text: e.message })
    } finally {
      setInviting(false)
    }
  }

  async function remove(memberId: string) {
    if (!confirm('Remover este membro do workspace?')) return
    const res = await fetch(`/api/workspaces/members?id=${memberId}`, { method: 'DELETE' })
    if (res.ok) loadMembers()
  }

  const canManage = currentRole === 'owner' || currentRole === 'admin'

  return (
    <Section title="Membros" subtitle="Quem tem acesso a este workspace.">

      {canManage && (
        <div className="bg-card border border-border p-4 mb-5 space-y-3">
          <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">Convidar pessoa</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="email"
                placeholder="email@dominio.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && invite()}
                className="w-full bg-background border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gold/50"
              />
            </div>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as any)}
              className="bg-background border border-border px-3 py-2 text-xs tracking-wide uppercase focus:outline-none focus:border-gold/50"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={invite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-1.5 bg-gold text-ink px-4 py-2 text-xs tracking-luxe uppercase font-semibold hover:bg-gold-soft transition-colors disabled:opacity-50"
            >
              {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Convidar
            </button>
          </div>
          {inviteMsg && (
            <p className={cn('text-xs', inviteMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400')}>
              {inviteMsg.type === 'ok' ? '✓ ' : '✗ '}{inviteMsg.text}
            </p>
          )}
        </div>
      )}

      <div className="border border-border divide-y divide-border">
        {loading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : members.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Nenhum membro.</div>
        ) : (
          members.map(m => (
            <div key={m.id} className="p-4 flex items-center justify-between bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-gold">
                    {m.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.email} {m.is_self && <span className="text-[10px] text-muted-foreground tracking-luxe uppercase ml-1">(você)</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground tracking-luxe uppercase mt-0.5 flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    Desde {new Date(m.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <RoleBadge role={m.role} />
                {canManage && !m.is_self && m.role !== 'owner' && (
                  <button
                    onClick={() => remove(m.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Section>
  )
}

function RoleBadge({ role }: { role: string }) {
  const cfg =
    role === 'owner'  ? { Icon: Crown,   label: 'Owner',  cls: 'border-gold/40 text-gold bg-gold/5' } :
    role === 'admin'  ? { Icon: Shield,  label: 'Admin',  cls: 'border-sky-500/30 text-sky-400 bg-sky-500/5' } :
                        { Icon: Edit3,   label: 'Editor', cls: 'border-zinc-500/30 text-zinc-400 bg-zinc-500/5' }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 border text-[9px] tracking-luxe uppercase font-medium', cfg.cls)}>
      <cfg.Icon className="h-2.5 w-2.5" /> {cfg.label}
    </span>
  )
}

// ─── Plan ──────────────────────────────────────────────────────────────────
function PlanSection({ organization }: { organization: Organization }) {
  return (
    <Section title="Plano & Cobrança" subtitle="Gerencie seu plano e detalhes de pagamento.">
      <div className="bg-card border border-border p-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-luxe uppercase text-muted-foreground">Plano atual</p>
          <p className="font-serif text-2xl mt-1 text-gold capitalize">{organization.plan}</p>
        </div>
        <a
          href="/billing"
          className="flex items-center gap-1.5 text-xs tracking-luxe uppercase border border-border px-4 py-2 hover:border-gold/40 hover:text-gold transition-colors"
        >
          Gerenciar <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Section>
  )
}

// ─── Danger ────────────────────────────────────────────────────────────────
function DangerSection({ workspace }: { workspace: Workspace }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function doDelete() {
    setDeleting(true); setError(null)
    try {
      const res = await fetch(`/api/workspaces/delete?id=${workspace.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      router.push('/workspaces')
    } catch (e: any) {
      setError(e.message)
      setDeleting(false)
    }
  }

  return (
    <Section title="Zona de risco" subtitle="Ações irreversíveis." accent="danger">
      <div className="border border-red-500/20 bg-red-500/5 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Excluir workspace</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Todas as pautas, geração e configurações deste workspace serão permanentemente excluídas.
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 border border-red-500/40 text-red-400 px-4 py-2 text-xs tracking-luxe uppercase hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir workspace
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Para confirmar, digite o nome do workspace: <span className="text-foreground font-mono">{workspace.name}</span>
            </p>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={workspace.name}
              className="w-full bg-background border border-red-500/30 px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
            {error && <p className="text-xs text-red-400">✗ {error}</p>}
            <div className="flex gap-2">
              <button
                onClick={doDelete}
                disabled={text !== workspace.name || deleting}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 text-xs tracking-luxe uppercase font-semibold hover:bg-red-600 transition-colors disabled:opacity-30"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Excluir definitivamente
              </button>
              <button
                onClick={() => { setConfirming(false); setText('') }}
                className="px-4 py-2 text-xs tracking-luxe uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function Section({ title, subtitle, children, accent }: {
  title: string
  subtitle?: string
  children: React.ReactNode
  accent?: 'danger'
}) {
  return (
    <section>
      <div className="mb-5">
        <h2 className={cn(
          'font-serif text-xl',
          accent === 'danger' ? 'text-red-400' : 'text-foreground'
        )}>{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
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
