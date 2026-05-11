/**
 * Limites de uso por plano + helper para checar/incrementar contadores.
 * Conta gerações de slides (a operação mais cara) por mês.
 */

import { createAdminClient } from '@/lib/supabase/server'

export type Plan = 'trial' | 'starter' | 'pro' | 'agency'

export const LIMITS: Record<Plan, { generationsPerMonth: number; workspaces: number }> = {
  trial:   { generationsPerMonth: 30,  workspaces: 1 },
  starter: { generationsPerMonth: 60,  workspaces: 3 },
  pro:     { generationsPerMonth: 200, workspaces: 10 },
  agency:  { generationsPerMonth: 999, workspaces: 30 },
}

/** Retorna primeiro dia do mês atual em ISO */
function monthStart(): string {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString()
}

/**
 * Conta gerações no mês corrente (baseado em generated_content).
 * Pode tornar mais sofisticado depois usando workspace_id direto.
 */
export async function getMonthlyUsage(workspaceId: string): Promise<number> {
  const admin = await createAdminClient()
  const since = monthStart()
  const { count } = await admin
    .from('generated_content')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', since)
  return count || 0
}

/** Busca o plano + override do workspace via organization */
export async function getWorkspaceLimits(workspaceId: string): Promise<{ plan: Plan; effectiveLimit: number }> {
  const admin = await createAdminClient()
  const { data: ws } = await admin
    .from('workspaces')
    .select('organization_id')
    .eq('id', workspaceId)
    .single()
  if (!ws) return { plan: 'trial', effectiveLimit: LIMITS.trial.generationsPerMonth }

  const { data: org } = await admin
    .from('organizations')
    .select('plan, generation_limit_override')
    .eq('id', ws.organization_id)
    .single()

  const plan = (org?.plan as Plan) || 'trial'
  const base = LIMITS[plan].generationsPerMonth
  // Override TEM PRIORIDADE quando definido — useful para conceder créditos extras
  const effectiveLimit = org?.generation_limit_override ?? base
  return { plan, effectiveLimit }
}

/** Legacy — mantido para compatibilidade */
export async function getWorkspacePlan(workspaceId: string): Promise<Plan> {
  const { plan } = await getWorkspaceLimits(workspaceId)
  return plan
}

/**
 * Resultado do check de limite — usar antes de chamar a IA.
 */
export interface LimitCheck {
  ok: boolean
  used: number
  limit: number
  plan: Plan
  remaining: number
}

export async function checkGenerationLimit(workspaceId: string): Promise<LimitCheck> {
  const { plan, effectiveLimit } = await getWorkspaceLimits(workspaceId)
  const used = await getMonthlyUsage(workspaceId)
  return {
    ok: used < effectiveLimit,
    used,
    limit: effectiveLimit,
    plan,
    remaining: Math.max(0, effectiveLimit - used),
  }
}
