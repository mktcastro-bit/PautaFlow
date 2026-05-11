'use client'

import Link from 'next/link'
import { ArrowLeft, Lock, Mail, ArrowRight } from 'lucide-react'

interface Props {
  plan: string
  current: number
  max: number
  userEmail: string
}

export function LimitReached({ plan, current, max, userEmail }: Props) {
  const subject = encodeURIComponent(`Solicitação de upgrade — ${userEmail}`)
  const body = encodeURIComponent(
    `Olá,\n\nGostaria de solicitar a liberação para criar mais workspaces.\n\n` +
    `Conta: ${userEmail}\n` +
    `Plano atual: ${plan}\n` +
    `Workspaces atuais: ${current} / ${max}\n\n` +
    `Por favor, me ajude com o upgrade ou com a liberação temporária.\n\nObrigado!`
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
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
              Plano atingido
            </span>
          </div>

          <div className="h-14 w-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6">
            <Lock className="h-6 w-6 text-gold" />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl leading-tight tracking-tight mb-4">
            Você está no <span className="italic text-gold">limite</span> do plano {plan}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-8">
            Seu plano atual permite <strong className="text-foreground">{max} workspace{max > 1 ? 's' : ''}</strong> e
            você já está usando <strong className="text-foreground">{current} de {max}</strong>.
          </p>

          {/* Bloco de progresso visual */}
          <div className="bg-card border border-border p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-luxe uppercase text-muted-foreground">Workspaces utilizados</span>
              <span className="font-serif text-2xl text-gold">{current}/{max}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gold" style={{ width: `${(current / max) * 100}%` }} />
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-3">
            <a
              href={`mailto:contato@pautaflow.com.br?subject=${subject}&body=${body}`}
              className="flex items-center justify-between gap-3 bg-gold text-ink px-5 py-4 hover:bg-gold-soft transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <div>
                  <p className="text-xs tracking-luxe uppercase font-bold">Solicitar liberação</p>
                  <p className="text-[10px] tracking-wide opacity-70 mt-0.5">Falar com nossa equipe</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              href="/billing"
              className="flex items-center justify-between gap-3 border border-border hover:border-gold/40 px-5 py-4 transition-colors group"
            >
              <div>
                <p className="text-xs tracking-luxe uppercase font-semibold">Ver planos disponíveis</p>
                <p className="text-[10px] tracking-wide text-muted-foreground mt-0.5">Comparar limites de workspaces</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          <p className="text-[10px] tracking-luxe uppercase text-muted-foreground/70 mt-8 leading-relaxed">
            Em fase de teste? Entre em contato — concedemos liberações pontuais para testes legítimos.
          </p>
        </div>
      </main>
    </div>
  )
}
