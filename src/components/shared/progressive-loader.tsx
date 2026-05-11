'use client'

import { useEffect, useState } from 'react'

interface Props {
  /** Mensagens que vão rotacionar durante o loading */
  steps: string[]
  /** Texto fixo abaixo das mensagens (ex: tempo estimado) */
  subtitle?: string
  /** Intervalo entre mensagens (ms) */
  intervalMs?: number
}

export function ProgressiveLoader({ steps, subtitle, intervalMs = 4000 }: Props) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (steps.length <= 1) return
    const t = setInterval(() => {
      setIdx(i => Math.min(i + 1, steps.length - 1))
    }, intervalMs)
    return () => clearInterval(t)
  }, [steps.length, intervalMs])

  return (
    <div className="text-center space-y-4 max-w-sm">
      <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />

      <div className="relative h-6 overflow-hidden">
        {steps.map((s, i) => (
          <p
            key={i}
            className="absolute inset-0 text-zinc-400 text-sm transition-all duration-500"
            style={{
              opacity: i === idx ? 1 : 0,
              transform: i === idx ? 'translateY(0)' : i < idx ? 'translateY(-100%)' : 'translateY(100%)',
            }}
          >
            {s}
          </p>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i <= idx ? 'w-6 bg-gold' : 'w-1.5 bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {subtitle && (
        <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-600">
          {subtitle}
        </p>
      )}
    </div>
  )
}
