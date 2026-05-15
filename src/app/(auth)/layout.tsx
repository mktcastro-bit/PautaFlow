export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">

      {/* Left — brand panel */}
      <div className="relative hidden lg:flex flex-col bg-ink p-12 overflow-hidden border-r border-border">
        {/* Subtle gold gradient orb */}
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative z-10">
          <h1 className="font-serif text-3xl tracking-tight">
            <span className="text-foreground">pauta</span><span className="text-gold italic">.</span>
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-luxe uppercase mt-1.5">
            Gestão Inteligente de Conteúdo
          </p>
        </div>

        <div className="relative z-10 mt-auto space-y-6 max-w-md">
          <blockquote className="font-serif text-3xl leading-tight text-foreground">
            Da ideia à publicação com <span className="text-gold italic">inteligência</span> e estratégia de marca.
          </blockquote>
          <p className="text-muted-foreground leading-relaxed">
            Gerencie pautas, defina o DNA da sua marca e gere conteúdo com IA em um só lugar.
          </p>
        </div>

        <div className="relative z-10 mt-12 flex gap-8 text-[10px] tracking-luxe uppercase text-muted-foreground">
          <span>14 dias grátis</span>
          <span>Sem cartão de crédito</span>
          <span>Cancele quando quiser</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-start mb-10 lg:hidden">
            <h1 className="font-serif text-2xl tracking-tight">
              <span className="text-foreground">pauta</span><span className="text-gold italic">.</span>
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
