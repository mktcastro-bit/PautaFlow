'use client'

import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft } from 'lucide-react'

/**
 * Banner do hero da landing: mockup de telefone com 1 post real
 * no feed do Instagram, mostrando a arte gerada pelo produto.
 */

export function HeroCarouselMockup() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto">

      {/* Glow dourado atrás do telefone */}
      <div className="absolute inset-0 bg-[#c9a86a]/15 blur-3xl rounded-full scale-110 pointer-events-none" />

      {/* Phone frame */}
      <div
        className="relative bg-[#0a0a0a] rounded-[44px] p-2.5 shadow-2xl"
        style={{
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,106,0.08), inset 0 0 0 1.5px rgba(255,255,255,0.06)',
        }}
      >
        {/* Inner screen */}
        <div className="relative bg-[#0a0a0a] rounded-[36px] overflow-hidden">

          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30 flex items-center justify-end pr-3">
            <div className="h-2 w-2 rounded-full bg-zinc-900 ring-1 ring-zinc-800" />
          </div>

          {/* Status bar (subtle) */}
          <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[10px] text-zinc-300 font-medium relative z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1 opacity-70">
              <div className="flex items-end gap-0.5">
                <div className="w-0.5 h-1.5 bg-zinc-300 rounded-full" />
                <div className="w-0.5 h-2 bg-zinc-300 rounded-full" />
                <div className="w-0.5 h-2.5 bg-zinc-300 rounded-full" />
                <div className="w-0.5 h-3 bg-zinc-300 rounded-full" />
              </div>
              <span className="ml-1 text-[9px]">5G</span>
              <div className="ml-1 relative w-5 h-2.5 border border-zinc-300 rounded-sm">
                <div className="absolute inset-0.5 bg-zinc-300 rounded-[1px]" style={{ width: '70%' }} />
                <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-zinc-300 rounded-r" />
              </div>
            </div>
          </div>

          {/* IG nav header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900/80">
            <ChevronLeft className="h-4 w-4 text-zinc-300" />
            <span className="text-[11px] font-semibold text-zinc-200 tracking-wide">
              Publicações
            </span>
            <div className="w-4" />
          </div>

          {/* Post header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-[#c9a86a] via-[#8a6f47] to-[#0a0a0a] p-[1.5px]">
                <div className="h-full w-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <span className="font-grotesque text-[10px] text-[#c9a86a] italic">m.</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-zinc-200 font-semibold leading-tight">
                  marca<span className="text-[#c9a86a]">.</span>
                </p>
                <p className="text-[9px] text-zinc-500 leading-tight mt-0.5">Patrocinado</p>
              </div>
            </div>
            <MoreHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          </div>

          {/* The art card (4:5) */}
          <div className="relative bg-[#0a0a0a] border-y border-zinc-900/80" style={{ aspectRatio: '4 / 5' }}>
            {/* Vertical gold accent bar */}
            <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#c9a86a]" />

            {/* Grain texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0)',
                backgroundSize: '18px 18px',
              }}
            />

            {/* Card header */}
            <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-10">
              <span className="font-grotesque text-base text-zinc-200 italic leading-none">
                marca<span className="text-[#c9a86a] not-italic">.</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="h-px w-4 bg-zinc-400/70" />
                <span className="text-[8px] tracking-[0.22em] uppercase text-zinc-300 font-semibold">
                  Estratégia
                </span>
              </div>
            </div>

            {/* Card content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 z-10">
              <div className="w-10 h-px bg-[#c9a86a] mb-3.5" />
              <h3 className="font-grotesque text-[#f0ece4] text-[26px] leading-[1.05] tracking-tight font-bold">
                A <em className="italic text-[#c9a86a] font-normal">IA</em> não vai te substituir.
              </h3>
              <p className="text-zinc-400 text-[12px] mt-3 leading-snug">
                A pessoa que sabe usar IA, vai.
              </p>
              <p className="text-[#c9a86a] text-[12px] mt-2 font-semibold">
                A escolha é agora.
              </p>
            </div>

            {/* Footer (slide counter + brand url) */}
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between z-10">
              <span className="text-[9px] tracking-[0.2em] text-zinc-400 font-medium">
                01 / 08
              </span>
              <div className="flex items-center gap-2">
                <div className="h-px w-3 bg-zinc-500/40" />
                <span className="text-[8px] tracking-[0.18em] text-zinc-500 font-medium">
                  marca.com.br
                </span>
              </div>
            </div>

            {/* "Slide indicator dots" — convention IG */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
              <span className="h-1 w-1 rounded-full bg-white" />
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="h-1 w-1 rounded-full bg-white/40" />
            </div>
          </div>

          {/* Interactions */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <Heart className="h-5 w-5 text-zinc-200" />
                <MessageCircle className="h-5 w-5 text-zinc-200" />
                <Send className="h-5 w-5 text-zinc-200" />
              </div>
              <Bookmark className="h-5 w-5 text-zinc-200" />
            </div>

            <p className="text-[10.5px] text-zinc-200 font-semibold">
              <span className="font-bold">2.341 curtidas</span>
            </p>

            <p className="text-[10.5px] text-zinc-300 leading-snug">
              <span className="font-semibold">marca<span className="text-[#c9a86a]">.</span></span>{' '}
              Quando a tecnologia não parte do humano, ela acelera decisões erradas.
              <span className="text-zinc-500"> mais…</span>
            </p>

            <p className="text-[9px] text-zinc-500 uppercase tracking-wider pt-0.5">
              Há 2 horas
            </p>
          </div>
        </div>
      </div>

      {/* Floating "gerado em 12s" badge */}
      <div className="absolute -left-6 top-1/3 bg-[#faf8f3] border border-[#c9a86a]/30 px-3 py-2 shadow-lg rotate-[-4deg] hidden xl:block">
        <p className="text-[8px] tracking-[0.2em] uppercase text-[#9a7d4a] font-bold">Gerado em</p>
        <p className="font-grotesque text-2xl text-zinc-950 leading-none mt-0.5">
          12<span className="text-[#c9a86a] italic">s</span>
        </p>
      </div>

      {/* Floating "DNA aplicado" badge */}
      <div className="absolute -right-4 bottom-1/4 bg-[#0a0a0a] border border-[#c9a86a]/40 px-3 py-2 shadow-lg rotate-[3deg] hidden xl:block">
        <p className="text-[8px] tracking-[0.2em] uppercase text-[#c9a86a] font-bold">DNA da marca</p>
        <p className="text-[10px] text-zinc-300 mt-0.5">aplicado</p>
      </div>
    </div>
  )
}
