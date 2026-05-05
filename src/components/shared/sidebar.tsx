'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap, LayoutDashboard, FileText, Dna, Calendar,
  Settings, CreditCard, ChevronDown, Plus, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Workspace, Organization } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  organization: Organization
  workspaces: Workspace[]
  currentWorkspace?: Workspace
}

export function Sidebar({ organization, workspaces, currentWorkspace }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const wsSlug = currentWorkspace?.slug
  const base = wsSlug ? `/workspaces/${wsSlug}` : null

  const navItems = base ? [
    { href: `${base}/pautas`, icon: FileText, label: 'Pautas' },
    { href: `${base}/generate`, icon: Zap, label: 'Gerar Conteúdo' },
    { href: `${base}/brand-dna`, icon: Dna, label: 'DNA da Marca' },
    { href: `${base}/calendar`, icon: Calendar, label: 'Calendário' },
    { href: `${base}/settings`, icon: Settings, label: 'Configurações' },
  ] : []

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{organization.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{organization.plan}</p>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
          Workspaces
        </p>
        <div className="space-y-0.5">
          {workspaces.map(ws => (
            <Link
              key={ws.id}
              href={`/workspaces/${ws.slug}/pautas`}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                currentWorkspace?.id === ws.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ws.color }}
              />
              <span className="truncate">{ws.name}</span>
            </Link>
          ))}
          <Link
            href="/workspaces/new"
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo workspace
          </Link>
        </div>
      </div>

      {base && (
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map(item => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      <div className="p-3 border-t border-border space-y-0.5">
        <Link
          href="/billing"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Plano & Cobrança
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
