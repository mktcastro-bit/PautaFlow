import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/is-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ──────────────────────────────────────────────────────────
// Tipos auxiliares
// ──────────────────────────────────────────────────────────
type UserRow = {
  id: string
  email: string | null
  created_at: string
  last_sign_in_at: string | null
}

type PautaRow = {
  id: string
  title: string
  status: string
  format: string | null
  platform: string[] | null
  created_at: string
  created_by: string | null
  workspace_id: string
}

type GenRow = {
  id: string
  created_at: string
  created_by: string | null
  workspace_id: string
  pauta_id: string | null
  platform: string | null
  format: string | null
  tokens_used: number | null
  model: string | null
}

type WorkspaceRow = { id: string; name: string }

// ──────────────────────────────────────────────────────────
// Helpers de formatação
// ──────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function daysAgo(iso: string | null) {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  const d = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (d === 0) return 'hoje'
  if (d === 1) return 'ontem'
  if (d < 30) return `${d}d atrás`
  if (d < 365) return `${Math.floor(d / 30)}mo atrás`
  return `${Math.floor(d / 365)}a atrás`
}

// ──────────────────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────────────────
export default async function AdminPainelPage() {
  // 1) Gate: precisa estar logado E ser admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/adminpainel')
  if (!isAdminEmail(user.email)) redirect('/workspaces')

  // 2) Usa service-role pra bypass RLS e ler auth.users
  const admin = await createAdminClient()

  // ── Buscar usuários (auth.users via admin API) ──
  const { data: usersResp } = await admin.auth.admin.listUsers({ perPage: 200 })
  const users: UserRow[] = (usersResp?.users ?? []).map(u => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }))
  const userMap = new Map(users.map(u => [u.id, u.email ?? u.id.slice(0, 8)]))

  // ── Pautas (últimas 100 + agregações) ──
  const { data: pautasData } = await admin
    .from('pautas')
    .select('id, title, status, format, platform, created_at, created_by, workspace_id')
    .order('created_at', { ascending: false })
    .limit(100)
  const pautas: PautaRow[] = pautasData ?? []

  // ── Generated content (últimas 100) ──
  const { data: gensData } = await admin
    .from('generated_content')
    .select('id, created_at, created_by, workspace_id, pauta_id, platform, format, tokens_used, model')
    .order('created_at', { ascending: false })
    .limit(100)
  const gens: GenRow[] = gensData ?? []

  // ── Workspaces (pra mostrar nome) ──
  const wsIds = Array.from(new Set([
    ...pautas.map(p => p.workspace_id),
    ...gens.map(g => g.workspace_id),
  ]))
  const { data: wsData } = wsIds.length
    ? await admin.from('workspaces').select('id, name').in('id', wsIds)
    : { data: [] as WorkspaceRow[] }
  const wsMap = new Map((wsData ?? []).map((w: WorkspaceRow) => [w.id, w.name]))

  // ── Pautas (totais por usuário) ──
  const { data: allPautasMinimal } = await admin
    .from('pautas')
    .select('created_by')
  const pautasByUser = new Map<string, number>()
  for (const row of allPautasMinimal ?? []) {
    if (!row.created_by) continue
    pautasByUser.set(row.created_by, (pautasByUser.get(row.created_by) ?? 0) + 1)
  }

  // ── Gens (totais + tokens por usuário) ──
  const { data: allGensMinimal } = await admin
    .from('generated_content')
    .select('created_by, tokens_used')
  const gensByUser = new Map<string, number>()
  const tokensByUser = new Map<string, number>()
  let totalTokens = 0
  for (const row of allGensMinimal ?? []) {
    if (row.created_by) {
      gensByUser.set(row.created_by, (gensByUser.get(row.created_by) ?? 0) + 1)
      tokensByUser.set(row.created_by, (tokensByUser.get(row.created_by) ?? 0) + (row.tokens_used ?? 0))
    }
    totalTokens += row.tokens_used ?? 0
  }

  // ── KPIs ──
  const totalUsers = users.length
  const totalPautas = allPautasMinimal?.length ?? 0
  const totalGens = allGensMinimal?.length ?? 0

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <header className="mb-10 pb-6 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold-dim mb-2">Interno · não listado</p>
            <h1 className="text-3xl font-serif">Painel admin</h1>
          </div>
          <div className="text-xs text-foreground/60">
            logado como <span className="text-gold">{user.email}</span>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Kpi label="Usuários" value={totalUsers} />
        <Kpi label="Pautas criadas" value={totalPautas} />
        <Kpi label="Gerações IA" value={totalGens} />
        <Kpi label="Tokens (total)" value={totalTokens.toLocaleString('pt-BR')} />
      </section>

      {/* Usuários */}
      <Section title="Usuários cadastrados" subtitle={`${totalUsers} contas`}>
        <Table>
          <thead>
            <Row head>
              <Cell>Email</Cell>
              <Cell>Cadastrou</Cell>
              <Cell>Último login</Cell>
              <Cell align="right">Pautas</Cell>
              <Cell align="right">Gerações</Cell>
              <Cell align="right">Tokens</Cell>
            </Row>
          </thead>
          <tbody>
            {users.length === 0 && (
              <Row>
                <Cell colSpan={6}><span className="text-foreground/40">Nenhum usuário ainda.</span></Cell>
              </Row>
            )}
            {users.map(u => (
              <Row key={u.id}>
                <Cell><span className="text-foreground">{u.email ?? '—'}</span></Cell>
                <Cell><span title={fmtDate(u.created_at)}>{daysAgo(u.created_at)}</span></Cell>
                <Cell><span title={fmtDate(u.last_sign_in_at)}>{daysAgo(u.last_sign_in_at)}</span></Cell>
                <Cell align="right">{pautasByUser.get(u.id) ?? 0}</Cell>
                <Cell align="right">{gensByUser.get(u.id) ?? 0}</Cell>
                <Cell align="right">{(tokensByUser.get(u.id) ?? 0).toLocaleString('pt-BR')}</Cell>
              </Row>
            ))}
          </tbody>
        </Table>
      </Section>

      {/* Pautas recentes */}
      <Section title="Pautas recentes" subtitle={`últimas ${pautas.length}`}>
        <Table>
          <thead>
            <Row head>
              <Cell>Quando</Cell>
              <Cell>Quem</Cell>
              <Cell>Workspace</Cell>
              <Cell>Título</Cell>
              <Cell>Formato</Cell>
              <Cell>Status</Cell>
            </Row>
          </thead>
          <tbody>
            {pautas.length === 0 && (
              <Row>
                <Cell colSpan={6}><span className="text-foreground/40">Nenhuma pauta ainda.</span></Cell>
              </Row>
            )}
            {pautas.map(p => (
              <Row key={p.id}>
                <Cell><span title={fmtDate(p.created_at)}>{daysAgo(p.created_at)}</span></Cell>
                <Cell>{p.created_by ? (userMap.get(p.created_by) ?? '—') : '—'}</Cell>
                <Cell>{wsMap.get(p.workspace_id) ?? '—'}</Cell>
                <Cell><span className="text-foreground line-clamp-1">{p.title}</span></Cell>
                <Cell>{p.format ?? '—'}</Cell>
                <Cell><StatusBadge status={p.status} /></Cell>
              </Row>
            ))}
          </tbody>
        </Table>
      </Section>

      {/* Gerações IA */}
      <Section title="Gerações de IA" subtitle={`últimas ${gens.length}`}>
        <Table>
          <thead>
            <Row head>
              <Cell>Quando</Cell>
              <Cell>Quem</Cell>
              <Cell>Workspace</Cell>
              <Cell>Plataforma</Cell>
              <Cell>Formato</Cell>
              <Cell align="right">Tokens</Cell>
              <Cell>Modelo</Cell>
            </Row>
          </thead>
          <tbody>
            {gens.length === 0 && (
              <Row>
                <Cell colSpan={7}><span className="text-foreground/40">Ainda sem gerações.</span></Cell>
              </Row>
            )}
            {gens.map(g => (
              <Row key={g.id}>
                <Cell><span title={fmtDate(g.created_at)}>{daysAgo(g.created_at)}</span></Cell>
                <Cell>{g.created_by ? (userMap.get(g.created_by) ?? '—') : '—'}</Cell>
                <Cell>{wsMap.get(g.workspace_id) ?? '—'}</Cell>
                <Cell>{g.platform ?? '—'}</Cell>
                <Cell>{g.format ?? '—'}</Cell>
                <Cell align="right">{(g.tokens_used ?? 0).toLocaleString('pt-BR')}</Cell>
                <Cell><span className="text-xs text-foreground/50">{g.model ?? '—'}</span></Cell>
              </Row>
            ))}
          </tbody>
        </Table>
      </Section>

      <footer className="mt-12 pt-6 border-t border-border text-xs text-foreground/40">
        Painel interno · acesso restrito por whitelist de email · não há link público para esta rota
      </footer>
    </main>
  )
}

// ──────────────────────────────────────────────────────────
// Componentinhos visuais (mantém estilo do app)
// ──────────────────────────────────────────────────────────
function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border rounded-lg p-4 bg-ink/40">
      <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50 mb-2">{label}</p>
      <p className="text-2xl font-serif text-gold">{value}</p>
    </div>
  )
}

function Section({
  title, subtitle, children,
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm tracking-[0.25em] uppercase text-foreground/80">{title}</h2>
        {subtitle && <span className="text-xs text-foreground/40">{subtitle}</span>}
      </div>
      <div className="border border-border rounded-lg overflow-hidden bg-ink/20">
        <div className="overflow-x-auto">{children}</div>
      </div>
    </section>
  )
}

function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm">{children}</table>
}

function Row({ children, head }: { children: React.ReactNode; head?: boolean }) {
  return (
    <tr className={head ? 'border-b border-border bg-ink/40' : 'border-b border-border/40 hover:bg-ink/30 transition-colors'}>
      {children}
    </tr>
  )
}

function Cell({
  children, align = 'left', colSpan,
}: { children: React.ReactNode; align?: 'left' | 'right'; colSpan?: number }) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-2.5 text-xs ${align === 'right' ? 'text-right tabular-nums' : 'text-left'} text-foreground/70`}
    >
      {children}
    </td>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ideia: 'bg-foreground/10 text-foreground/60',
    em_desenvolvimento: 'bg-blue-500/10 text-blue-300',
    aprovado: 'bg-emerald-500/10 text-emerald-300',
    publicado: 'bg-gold/15 text-gold',
    arquivado: 'bg-foreground/5 text-foreground/40',
  }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${colors[status] ?? 'bg-foreground/10 text-foreground/60'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
