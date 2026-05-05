import Link from 'next/link'
import { Zap, FileText, Dna, Calendar, Download, Check, ArrowRight, Sparkles } from 'lucide-react'
import { PLAN_DETAILS } from '@/types'

export default function LandingPage() {
  const plans = ['starter', 'pro', 'agency'] as const

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur sticky top-0 z-10 bg-background/80">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">PautaFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Claude (Anthropic)
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
          Do briefing à publicação
          <br />
          com inteligência artificial
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          PautaFlow é a plataforma que une gestão de pautas, DNA da marca e geração de conteúdo
          com IA para equipes de marketing e agências.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 border border-input px-6 py-3 rounded-xl font-semibold hover:bg-accent transition-colors text-sm"
          >
            Ver demonstração
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-4">14 dias grátis · Sem cartão de crédito</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Tudo que você precisa para criar conteúdo</h2>
          <p className="text-muted-foreground">Em um só lugar, para toda a sua equipe</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: FileText,
              title: 'Repositório de Pautas',
              description: 'Organize suas ideias com filtros por status, plataforma, categoria e prioridade. Nunca perca uma boa pauta.'
            },
            {
              icon: Dna,
              title: 'DNA da Marca',
              description: 'Wizard de 5 etapas para definir identidade, público-alvo, tom de voz, estética e posicionamento da sua marca.'
            },
            {
              icon: Sparkles,
              title: 'Geração com IA',
              description: 'Gere posts, carrosséis, threads, artigos e newsletters com Claude — personalizado ao DNA da sua marca.'
            },
            {
              icon: Calendar,
              title: 'Calendário Editorial',
              description: 'Visualize e planeje todas as publicações em um calendário interativo. Nunca perca um deadline.'
            },
            {
              icon: Download,
              title: 'Export / Import JSON',
              description: 'Exporte todas as suas pautas e calendário. Importe de outros workspaces. Seus dados sempre com você.'
            },
            {
              icon: Zap,
              title: 'Multi-workspace',
              description: 'Gerencie múltiplas marcas ou clientes em workspaces separados. Ideal para agências.'
            },
          ].map((feature, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Planos simples e transparentes</h2>
          <p className="text-muted-foreground">Comece com 14 dias grátis. Cancele quando quiser.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const details = PLAN_DETAILS[plan]
            const isPopular = plan === 'pro'

            return (
              <div
                key={plan}
                className={`bg-card border rounded-2xl p-6 flex flex-col ${
                  isPopular ? 'border-primary shadow-xl shadow-primary/10' : 'border-border'
                }`}
              >
                {isPopular && (
                  <div className="text-xs font-bold text-primary bg-primary/10 w-fit px-2.5 py-1 rounded-full mb-4">
                    Mais popular
                  </div>
                )}
                <h3 className="font-bold text-xl mb-1">{details.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{details.description}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-black">R$ {details.price}</span>
                  <span className="text-muted-foreground mb-1">/mês</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {details.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full py-3 text-center rounded-xl text-sm font-semibold transition-colors ${
                    isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-input hover:bg-accent'
                  }`}
                >
                  Começar grátis
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para transformar seu processo de criação?
        </h2>
        <p className="text-muted-foreground mb-8">
          Junte-se a times de marketing que já usam PautaFlow para produzir mais com menos esforço.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <Zap className="h-5 w-5" />
          Criar conta grátis agora
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">PautaFlow</span>
        </div>
        <p>© {new Date().getFullYear()} PautaFlow · Todos os direitos reservados</p>
      </footer>
    </div>
  )
}
