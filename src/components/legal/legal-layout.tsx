import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
  updatedAt: string  // ex: "08 de maio de 2026"
  children: React.ReactNode
}

export function LegalLayout({ title, subtitle, updatedAt, children }: Props) {
  return (
    <div
      className="min-h-screen bg-[#faf8f3] text-zinc-950"
      style={{ backgroundColor: '#faf8f3', color: '#0a0a0a' }}
      data-theme="light"
    >
      {/* Nav minimal */}
      <nav className="border-b border-zinc-200 bg-[#faf8f3]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-baseline group">
            <ArrowLeft className="h-3 w-3 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="font-grotesque text-2xl tracking-tight text-zinc-950">pauta</span>
            <span className="font-grotesque text-2xl text-[#c9a86a] italic">.</span>
          </Link>
          <div className="flex items-center gap-4 text-xs tracking-[0.18em] uppercase">
            <Link href="/termos" className="text-zinc-600 hover:text-zinc-950 transition-colors">Termos</Link>
            <Link href="/privacidade" className="text-zinc-600 hover:text-zinc-950 transition-colors">Privacidade</Link>
            <Link href="/login" className="text-zinc-600 hover:text-zinc-950 transition-colors">Entrar</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 lg:px-10 pt-16 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-[#c9a86a]" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#9a7d4a] font-semibold">
            Documento legal
          </span>
        </div>
        <h1 className="font-grotesque text-4xl md:text-6xl leading-tight tracking-tight mb-4">
          {title}
        </h1>
        <p className="text-zinc-700 text-lg leading-relaxed max-w-2xl">{subtitle}</p>
        <p className="mt-6 text-[10px] tracking-[0.2em] uppercase text-zinc-500">
          Última atualização · {updatedAt}
        </p>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-10 pb-32">
        <div className="prose-legal">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-zinc-500 py-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline">
            <span className="font-grotesque text-xl tracking-tight text-zinc-300">pauta</span>
            <span className="font-grotesque text-xl text-[#c9a86a] italic">.</span>
          </div>
          <p className="text-[10px] tracking-[0.2em] uppercase">
            © {new Date().getFullYear()} · Todos os direitos reservados
          </p>
        </div>
      </footer>

      {/* Estilos do conteúdo legal */}
      <style>{`
        .prose-legal h2 {
          font-family: var(--font-grotesque), system-ui, sans-serif;
          font-size: 1.75rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          color: #0a0a0a;
          font-weight: 700;
        }
        .prose-legal h2:first-child { margin-top: 0; }
        .prose-legal h3 {
          font-family: var(--font-grotesque), system-ui, sans-serif;
          font-size: 1.125rem;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          color: #0a0a0a;
          font-weight: 600;
        }
        .prose-legal p {
          color: #3f3f46;
          line-height: 1.75;
          margin-bottom: 1rem;
        }
        .prose-legal ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.5rem;
        }
        .prose-legal li {
          color: #3f3f46;
          line-height: 1.75;
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.5rem;
        }
        .prose-legal li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.75em;
          height: 1px;
          width: 0.75rem;
          background: #c9a86a;
        }
        .prose-legal a {
          color: #9a7d4a;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-legal a:hover { color: #c9a86a; }
        .prose-legal strong { color: #0a0a0a; font-weight: 600; }
      `}</style>
    </div>
  )
}
