'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

interface Props {
  workspaceSlug: string
  /** Se true, banner aparece como faixa fixa no topo */
  variant?: 'inline' | 'sticky'
}

export function DnaIncompleteBanner({ workspaceSlug, variant = 'inline' }: Props) {
  return (
    <div className={
      variant === 'sticky'
        ? 'sticky top-0 z-50 bg-gold/10 border-b border-gold/30 backdrop-blur'
        : 'bg-gold/10 border border-gold/30 rounded-lg'
    }>
      <div className="flex items-center justify-between gap-4 px-5 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="h-4 w-4 text-gold flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gold">
              Configure o DNA da marca para conteúdo personalizado
            </p>
            <p className="text-[10px] text-muted-foreground tracking-wide truncate">
              Sem o DNA, a IA gera conteúdo genérico — leva 3 min
            </p>
          </div>
        </div>
        <Link
          href={`/workspaces/${workspaceSlug}/brand-dna?welcome=1`}
          className="flex items-center gap-1.5 bg-gold text-ink px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-gold-soft transition-colors flex-shrink-0"
        >
          Configurar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
