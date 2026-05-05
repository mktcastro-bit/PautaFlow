import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col bg-primary p-10 text-white">
        <div className="flex items-center gap-2 mb-auto">
          <Zap className="h-6 w-6" />
          <span className="font-bold text-xl">PautaFlow</span>
        </div>
        <div className="space-y-4">
          <blockquote className="text-2xl font-semibold leading-relaxed">
            "Da ideia à publicação com inteligência artificial e estratégia de marca."
          </blockquote>
          <p className="text-primary-foreground/80">
            Gerencie pautas, defina o DNA da sua marca e gere conteúdo com IA em um só lugar.
          </p>
        </div>
        <div className="mt-auto flex gap-8 text-sm text-primary-foreground/70">
          <span>14 dias grátis</span>
          <span>Sem cartão de crédito</span>
          <span>Cancele quando quiser</span>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">PautaFlow</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
