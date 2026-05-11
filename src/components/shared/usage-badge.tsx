'use client'

import { useEffect, useState } from 'react'

interface Props {
  workspaceId: string
  refreshKey?: number  // muda quando uma geração é feita, força refetch
}

interface UsageData {
  used: number
  limit: number
  plan: string
  remaining: number
}

export function UsageBadge({ workspaceId, refreshKey = 0 }: Props) {
  const [data, setData] = useState<UsageData | null>(null)

  useEffect(() => {
    fetch(`/api/usage?workspace_id=${workspaceId}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [workspaceId, refreshKey])

  if (!data) return null

  const pct = (data.used / data.limit) * 100
  const tone =
    pct >= 100 ? 'text-red-400 border-red-500/40 bg-red-500/10' :
    pct >= 80  ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                 'text-zinc-500 border-zinc-700 bg-zinc-900/40'

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 border text-[10px] tracking-[0.15em] uppercase font-medium ${tone}`}
      title={`${data.used} de ${data.limit} gerações utilizadas neste mês · Plano ${data.plan}`}
    >
      <span className="font-bold">{data.used}/{data.limit}</span>
      <span className="opacity-60">gerações</span>
    </div>
  )
}
