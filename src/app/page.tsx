import Link from 'next/link'
import {
  FileText, Dna, Calendar, Download, Check, ArrowRight, Sparkles, Zap,
  ChevronRight, Quote
} from 'lucide-react'
import { PLAN_DETAILS } from '@/types'

export default function LandingPage() {
  const plans = ['starter', 'pro', 'agency'] as const

  return (
    <div
      className="min-h-screen bg-[#faf8f3] text-zinc-950"
      style={{ backgroundColor: '#faf8f3', color: '#0a0a0a' }}
      data-theme="light"
    >

      {/* ── NAV (light) ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[#faf8f3]/85 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl tracking-tight text-zinc-950">pauta</span>
            <span className="font-serif text-2xl text-[#c9a86a] italic">flow</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/login" className="text-xs tracking-[0.18em] uppercase text-zinc-700 hover:text-zinc-950 transition-colors px-4 py-2">
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-xs tracking-[0.18em] uppercase bg-zinc-950 text-[#faf8f3] px-5 py-2.5 hover:bg-zinc-800 transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO (light) ────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-32">
        {/* Decorative gold rule + tag */}
        <div className="flex items-center gap-3 mb-10">
          <div className="h-px w-12 bg-[#c9a86a]" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#9a7d4a] font-semibold">
            Powered by Anthropic Claude
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tight text-zinc-950 max-w-5xl">
          Da ideia à publicação,
          <br />
          com <span className="italic text-[#c9a86a]">inteligência</span> de marca.
        </h1>

        <p className="mt-10 max-w-xl text-lg text-zinc-700 leading-relaxed">
          PautaFlow une <strong className="font-medium text-zinc-950">DNA da marca</strong>, repositório de pautas e
          geração visual com IA — para times de marketing produzirem conteúdo coerente, em escala.
        </p>

        <div className="mt-10 flex items-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-zinc-950 text-[#faf8f3] px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#1a1a1a] transition-colors"
          >
            Criar conta grátis
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-zinc-300 hover:border-zinc-950 px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium transition-colors"
          >
            Ver demonstração
          </Link>
        </div>

        <p className="mt-6 text-[10px] tracking-[0.2em] uppercase text-zinc-500">
          14 dias grátis · sem cartão de crédito · cancele quando quiser
        </p>

        {/* Decorative big serif watermark */}
        <div className="absolute -right-10 top-32 font-serif text-[280px] text-[#c9a86a] opacity-[0.06] leading-none italic pointer-events-none select-none hidden lg:block">
          P
        </div>
      </section>

      {/* ── BAND DOURADO FINO (transition) ─────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a86a]/40 to-transparent" />

      {/* ── FEATURES (DARK contrast) ────────────────────────────────── */}
      <section className="bg-[#0a0a0a] text-[#f0ece4] py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-[#c9a86a]" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#c9a86a] font-semibold">
                  O que está dentro
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] tracking-tight max-w-2xl">
                Tudo que sua equipe precisa para criar conteúdo de marca, <span className="italic text-[#c9a86a]">com método</span>.
              </h2>
            </div>
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              Em um só fluxo. Da estratégia à arte final.
              Sem alternar entre Notion, Trello, Canva e ChatGPT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900">
            {[
              { icon: Dna, title: 'DNA da Marca', n: '01', description: 'Wizard guiado de 5 etapas. Identidade, público, voz, estética e posicionamento. Toda geração futura herda esse DNA.' },
              { icon: FileText, title: 'Repositório de Pautas', n: '02', description: 'Filtros por status, pilar, formato e plataforma. Cards clicáveis abrem o editor com tudo restaurado.' },
              { icon: Sparkles, title: 'Geração com IA', n: '03', description: 'Carrosséis, posts, threads e artigos com Claude. 6 layouts editoriais que rotacionam automaticamente.' },
              { icon: Calendar, title: 'Calendário Editorial', n: '04', description: 'Visualize e planeje publicações futuras. Nunca perca um deadline.' },
              { icon: Download, title: 'Export ZIP / JSON', n: '05', description: 'Baixe slides em PNG + legenda em um único arquivo. Migre dados entre workspaces.' },
              { icon: Zap, title: 'Multi-workspace', n: '06', description: 'Marcas ou clientes em workspaces separados, com membros e roles. Ideal para agências.' },
            ].map((f, i) => (
              <div key={i} className="bg-[#0a0a0a] p-10 hover:bg-[#0e0e0e] transition-colors group">
                <div className="flex items-start justify-between mb-8">
                  <f.icon className="h-6 w-6 text-[#c9a86a]" />
                  <span className="font-serif text-2xl text-[#c9a86a]/40 italic">{f.n}</span>
                </div>
                <h3 className="font-serif text-2xl mb-3 leading-tight">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESSO (light) ────────────────────────────────────────── */}
      <section className="bg-[#faf8f3] py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c9a86a]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#9a7d4a] font-semibold">
              Como funciona
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.05] tracking-tight max-w-3xl mb-20">
            Três passos para sua marca falar <span className="italic text-[#c9a86a]">sozinha</span>.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-6">
            {[
              {
                n: '01',
                title: 'Configure o DNA',
                description: 'Wizard guiado de 5 etapas. Cores, tipografia e tom captados automaticamente do seu site.',
              },
              {
                n: '02',
                title: 'Gere com IA',
                description: 'Sugira ideias, escolha uma e a IA monta o carrossel. Layouts editoriais distintos por slide.',
              },
              {
                n: '03',
                title: 'Edite e publique',
                description: 'Ajuste fundo, cores e tipografia no editor visual. Exporte em ZIP pronto para publicação.',
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="font-serif text-7xl text-[#c9a86a] italic leading-none mb-6">{step.n}</div>
                <h3 className="font-serif text-2xl mb-3">{step.title}</h3>
                <p className="text-zinc-700 leading-relaxed">{step.description}</p>
                {i < 2 && (
                  <ChevronRight className="hidden lg:block absolute -right-4 top-8 h-6 w-6 text-[#c9a86a]/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE (light, with cream contrast) ──────────────────────── */}
      <section className="bg-zinc-100 py-24 border-y border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <Quote className="h-10 w-10 text-[#c9a86a] mx-auto mb-8" />
          <blockquote className="font-serif text-3xl md:text-4xl leading-[1.2] tracking-tight text-zinc-950">
            "Conteúdo bem feito não nasce de fórmula.
            Nasce de <span className="italic text-[#c9a86a]">marca clara</span> + estratégia + execução."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3 text-[10px] tracking-[0.3em] uppercase text-zinc-500">
            <div className="h-px w-8 bg-[#c9a86a]" />
            Princípio fundador
            <div className="h-px w-8 bg-[#c9a86a]" />
          </div>
        </div>
      </section>

      {/* ── PRICING (light, com Pro card DARK) ─────────────────────── */}
      <section className="bg-[#faf8f3] py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#c9a86a]" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#9a7d4a] font-semibold">
                Planos
              </span>
              <div className="h-px w-12 bg-[#c9a86a]" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
              Simples e <span className="italic text-[#c9a86a]">transparente</span>.
            </h2>
            <p className="text-zinc-700 mt-4">14 dias grátis. Cancele quando quiser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 max-w-5xl mx-auto">
            {plans.map(plan => {
              const details = PLAN_DETAILS[plan]
              const isPopular = plan === 'pro'
              return (
                <div
                  key={plan}
                  className={`relative p-10 flex flex-col ${
                    isPopular
                      ? 'bg-[#0a0a0a] text-[#f0ece4]'
                      : 'bg-white text-zinc-950'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-6 right-6 text-[9px] tracking-[0.25em] uppercase text-[#c9a86a] font-bold">
                      ★ Recomendado
                    </div>
                  )}
                  <h3 className="font-serif text-2xl mb-2">{details.name}</h3>
                  <p className={`text-xs ${isPopular ? 'text-zinc-400' : 'text-zinc-600'} mb-8`}>
                    {details.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className={`text-xs ${isPopular ? 'text-[#c9a86a]' : 'text-zinc-500'}`}>R$</span>
                    <span className="font-serif text-6xl tracking-tight">{details.price}</span>
                    <span className={`text-xs ml-1 ${isPopular ? 'text-zinc-400' : 'text-zinc-500'}`}>/mês</span>
                  </div>
                  <ul className="space-y-3 mb-10 flex-1">
                    {details.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isPopular ? 'text-[#c9a86a]' : 'text-emerald-600'}`} />
                        <span className={isPopular ? 'text-zinc-300' : 'text-zinc-700'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`w-full py-4 text-center text-xs tracking-[0.2em] uppercase font-semibold transition-colors ${
                      isPopular
                        ? 'bg-[#c9a86a] text-zinc-950 hover:bg-[#d4b878]'
                        : 'bg-zinc-950 text-[#faf8f3] hover:bg-zinc-800'
                    }`}
                  >
                    Começar grátis
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL (DARK dramatic) ──────────────────────────────── */}
      <section className="bg-[#0a0a0a] text-[#f0ece4] py-32 relative overflow-hidden">
        {/* Gold orb */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-[#c9a86a]/10 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 lg:px-10 relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px w-12 bg-[#c9a86a]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#c9a86a] font-semibold">
              É hora
            </span>
          </div>
          <h2 className="font-serif text-5xl md:text-7xl leading-[1.0] tracking-tight mb-8">
            Sua marca, <span className="italic text-[#c9a86a]">no comando</span>.
            <br />
            A IA, na execução.
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mb-12 leading-relaxed">
            Junte-se a equipes que produzem mais, com mais consistência, sem perder a alma da marca.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 bg-[#c9a86a] text-zinc-950 px-10 py-5 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#d4b878] transition-colors"
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER (dark) ──────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] text-zinc-500 border-t border-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-xl tracking-tight text-zinc-300">pauta</span>
            <span className="font-serif text-xl text-[#c9a86a] italic">flow</span>
          </div>
          <p className="text-[10px] tracking-[0.2em] uppercase">
            © {new Date().getFullYear()} · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-6 text-[10px] tracking-[0.2em] uppercase">
            <Link href="/login" className="hover:text-[#c9a86a] transition-colors">Entrar</Link>
            <Link href="/register" className="hover:text-[#c9a86a] transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
