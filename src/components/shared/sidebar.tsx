'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap, FileText, Dna, Calendar,
  Settings, CreditCard, Plus, LogOut, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Workspace, Organization } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  organization: Organization
  workspaces: Workspace[]
  currentWorkspace?: Workspace
}

export function Sidebar({ organization, workspaces, currentWorkspace }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Fecha sidebar mobile ao navegar
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Trava scroll do body quando sidebar mobile está aberta
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const wsSlug = currentWorkspace?.slug
  const base = wsSlug ? `/workspaces/${wsSlug}` : null

  const navItems = base ? [
    { href: `${base}/pautas`,    icon: FileText, label: 'Pautas' },
    { href: `${base}/generate`,  icon: Zap,      label: 'Gerar Conteúdo' },
    { href: `${base}/brand-dna`, icon: Dna,      label: 'DNA da Marca' },
    { href: `${base}/calendar`,  icon: Calendar, label: 'Calendário' },
    { href: `${base}/settings`,  icon: Settings, label: 'Configurações' },
  ] : []

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <>
      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-tight leading-none">
            <span className="text-foreground">nexum</span><span className="text-gold">360</span>
          </h1>
          <p className="text-[9px] text-muted-foreground tracking-luxe uppercase mt-1.5">
            {organization.name} · {organization.plan}
          </p>
        </div>
        {/* Botão fechar (mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Workspaces ────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-border">
        <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-luxe mb-3">
          Workspaces
        </p>
        <div className="space-y-1">
          {workspaces.map(ws => {
            const active = currentWorkspace?.id === ws.id
            return (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.slug}/pautas`}
                className={cn(
                  'flex items-center gap-2 py-1.5 text-sm transition-colors group',
                  active ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all',
                    active ? 'bg-gold ring-2 ring-gold/20' : 'bg-border group-hover:bg-foreground/40'
                  )}
                  style={!active && ws.color ? { backgroundColor: ws.color, opacity: 0.4 } : undefined}
                />
                <span className="truncate">{ws.name}</span>
              </Link>
            )
          })}
          <Link
            href="/workspaces/new"
            className="flex items-center gap-2 py-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            <Plus className="h-3 w-3" />
            Novo workspace
          </Link>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      {base && (
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group',
                    active ? 'text-gold bg-gold/5' : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-gold rounded-r" />
                  )}
                  <item.icon className={cn(
                    'h-4 w-4 flex-shrink-0 transition-colors',
                    active ? 'text-gold' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  <span className={cn('flex-1', active && 'font-medium')}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        <Link
          href="/billing"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Plano & Cobrança
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile top bar (fixa) ─────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-foreground"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-serif text-lg tracking-tight leading-none">
          <span className="text-foreground">nexum</span><span className="text-gold">360</span>
        </h1>
        <div className="w-9" />
      </div>

      {/* Espaço pra topbar fixa em mobile */}
      <div className="lg:hidden h-14 flex-shrink-0" />

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 border-r border-border bg-background flex-col h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar (drawer) ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[85vw] bg-background border-r border-border flex flex-col animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
