'use client'

/**
 * Banner do hero da landing: 3 cards de pauta em leque,
 * mostrando a estética do produto (preto + dourado + serif).
 * Hover no container destaca o card frontal.
 */

interface CardData {
  pilar: string
  number: string
  total: string
  layout: 'hero' | 'quote' | 'numbered'
  title: React.ReactNode
  subtitle?: string
  callout?: string
  brand: string
}

const CARDS: CardData[] = [
  // Card 3 (fundo)
  {
    pilar: 'INSIGHT',
    number: '07',
    total: '08',
    layout: 'numbered',
    title: <>Salve este post <em className="text-[#c9a86a] not-italic font-normal">antes</em> de gerar o seu.</>,
    subtitle: 'A IA não substitui estratégia. Mas amplifica quem tem.',
    brand: 'marca',
  },
  // Card 2 (meio)
  {
    pilar: 'BRANDING',
    number: '04',
    total: '08',
    layout: 'quote',
    title: <>Por que sua marca <em className="italic">soa igual</em> a todas as outras.</>,
    subtitle: 'Sem DNA, todo conteúdo vira ruído.',
    brand: 'marca',
  },
  // Card 1 (frente)
  {
    pilar: 'ESTRATÉGIA',
    number: '01',
    total: '08',
    layout: 'hero',
    title: <>A <em className="italic text-[#c9a86a]">IA</em> não vai te substituir.</>,
    subtitle: 'A pessoa que sabe usar IA, vai.',
    callout: 'A escolha é agora.',
    brand: 'marca',
  },
]

export function HeroCarouselMockup() {
  return (
    <div className="relative w-full max-w-md aspect-[4/5] mx-auto group">
      {/* Glow dourado sutil atrás dos cards */}
      <div className="absolute inset-0 bg-[#c9a86a]/10 blur-3xl rounded-full scale-90 pointer-events-none" />

      {CARDS.map((card, i) => {
        // i=0 fundo, i=1 meio, i=2 frente
        const z = i + 1
        const rotateZ = i === 0 ? -8 : i === 1 ? -3 : 4
        const translateX = i === 0 ? -28 : i === 1 ? 0 : 28
        const translateY = i === 0 ? 24 : i === 1 ? 12 : 0
        const opacity = i === 2 ? 1 : 0.96

        return (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-500 ease-out"
            style={{
              zIndex: z,
              transform: `translate(${translateX}px, ${translateY}px) rotate(${rotateZ}deg)`,
              opacity,
            }}
          >
            <PautaCardMockup data={card} isFront={i === 2} />
          </div>
        )
      })}

      {/* Gold accent line abaixo do leque */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#c9a86a] to-transparent" />
    </div>
  )
}

// ─── Card individual ────────────────────────────────────────────────────────
function PautaCardMockup({ data, isFront }: { data: CardData; isFront: boolean }) {
  return (
    <div
      className="w-full h-full bg-[#0a0a0a] relative overflow-hidden border border-zinc-900"
      style={{
        boxShadow: isFront
          ? '0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(201, 168, 106, 0.1)'
          : '0 20px 40px -20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Barra dourada lateral */}
      <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#c9a86a]" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header */}
      <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-10">
        <span className="font-grotesque text-sm text-zinc-200 italic">
          {data.brand}<span className="text-[#c9a86a] not-italic">.</span>
        </span>
        <div className="flex items-center gap-2">
          <div className="h-px w-3 bg-zinc-500/60" />
          <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-400 font-semibold">
            {data.pilar}
          </span>
        </div>
      </div>

      {/* Conteúdo central — varia por layout */}
      <div className="absolute inset-0 flex flex-col justify-center px-5 z-10">
        {data.layout === 'hero' && (
          <>
            <div className="w-8 h-px bg-[#c9a86a] mb-3" />
            <h3 className="font-grotesque text-[#f0ece4] text-xl leading-[1.1] tracking-tight font-bold">
              {data.title}
            </h3>
            {data.subtitle && (
              <p className="text-zinc-400 text-[11px] mt-3 leading-snug">
                {data.subtitle}
              </p>
            )}
            {data.callout && (
              <p className="text-[#c9a86a] text-[11px] mt-2 font-semibold">
                {data.callout}
              </p>
            )}
          </>
        )}

        {data.layout === 'quote' && (
          <>
            <div className="font-grotesque text-[#c9a86a] text-6xl leading-[0.5] italic font-bold mb-1 opacity-80">
              “
            </div>
            <div className="border-l border-[#c9a86a] pl-3">
              <h3 className="font-grotesque text-[#f0ece4] text-base leading-[1.2] italic font-medium">
                {data.title}
              </h3>
              {data.subtitle && (
                <p className="text-zinc-400 text-[10px] mt-2 leading-snug">— {data.subtitle}</p>
              )}
            </div>
          </>
        )}

        {data.layout === 'numbered' && (
          <div className="flex items-start gap-3">
            <span className="font-grotesque text-[#c9a86a] text-4xl italic leading-none">
              03
            </span>
            <div className="flex-1 pt-1">
              <div className="w-4 h-px bg-[#c9a86a] mb-2" />
              <h3 className="font-grotesque text-[#f0ece4] text-sm leading-[1.2] font-semibold">
                {data.title}
              </h3>
              {data.subtitle && (
                <p className="text-zinc-400 text-[10px] mt-2 leading-snug">
                  {data.subtitle}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between z-10">
        <span className="text-[9px] tracking-[0.18em] text-zinc-400 font-medium">
          {data.number} / {data.total}
        </span>
        <div className="flex items-center gap-2">
          <div className="h-px w-3 bg-zinc-500/40" />
          <span className="text-[8px] tracking-[0.15em] text-zinc-500 font-medium">
            {data.brand}.com.br
          </span>
        </div>
      </div>
    </div>
  )
}
