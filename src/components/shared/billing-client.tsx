'use client'

import { useState } from 'react'
import { Check, Zap, CreditCard, AlertTriangle } from 'lucide-react'
import { Organization, Plan, PLAN_DETAILS } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  organization: Organization
  userRole: 'owner' | 'admin' | 'member'
}

export function BillingClient({ organization, userRole }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const currentPlan = organization.plan
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'

  async function handleUpgrade(plan: Plan) {
    if (!isOwnerOrAdmin) return
    setLoading(plan)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })

    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  async function handleManage() {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  const plans: Plan[] = ['starter', 'pro', 'agency']

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Plano & Cobrança</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gerencie seu plano e informações de pagamento
        </p>
      </div>

      {/* Current plan banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Plano atual</p>
          <h2 className="text-xl font-bold capitalize mt-0.5">{PLAN_DETAILS[currentPlan].name}</h2>
          {organization.trial_ends_at && organization.stripe_subscription_status === 'trialing' && (
            <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Trial expira em {new Date(organization.trial_ends_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        {organization.stripe_customer_id && (
          <button
            onClick={handleManage}
            disabled={loading === 'portal'}
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            {loading === 'portal' ? 'Aguarde...' : 'Gerenciar pagamento'}
          </button>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => {
          const details = PLAN_DETAILS[plan]
          const isCurrent = plan === currentPlan
          const isPopular = plan === 'pro'

          return (
            <div
              key={plan}
              className={cn(
                'bg-card border rounded-2xl p-6 flex flex-col',
                isPopular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border',
                isCurrent && 'ring-2 ring-primary'
              )}
            >
              {isPopular && (
                <div className="text-xs font-bold text-primary bg-primary/10 w-fit px-2.5 py-1 rounded-full mb-4">
                  Mais popular
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-bold text-lg">{details.name}</h3>
                <p className="text-muted-foreground text-sm mt-0.5">{details.description}</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold">R$ {details.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">/mês</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {details.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-2.5 text-center rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  Plano atual
                </div>
              ) : isOwnerOrAdmin ? (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading === plan}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-input hover:bg-accent'
                  )}
                >
                  {loading === plan ? 'Aguarde...' : (
                    <>
                      <Zap className="h-3.5 w-3.5 inline mr-1.5" />
                      {plan === 'starter' ? 'Fazer downgrade' : 'Fazer upgrade'}
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full py-2.5 text-center rounded-xl text-sm text-muted-foreground border border-input">
                  Contate o proprietário
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Todos os planos incluem 14 dias grátis. Cancele quando quiser.
        Os preços são em BRL e cobrados mensalmente.
      </p>
    </div>
  )
}
