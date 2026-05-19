/**
 * Tradução de erros da Anthropic SDK em mensagens amigáveis ao usuário.
 * Anthropic SDK lança APIError com .status numérico.
 */

export interface FriendlyError {
  /** Mensagem visível ao usuário (curta, sem jargão técnico) */
  message: string
  /** Sugestão de ação */
  hint?: string
  /** HTTP status sugerido para a resposta da API */
  status: number
  /** Tipo do erro pra log/telemetria */
  type: 'auth' | 'rate_limit' | 'credit' | 'overloaded' | 'invalid' | 'network' | 'unknown'
}

export function mapAnthropicError(err: any): FriendlyError {
  // Anthropic APIError tem .status numérico
  const status: number | undefined = err?.status

  // 401 / 403 — chave inválida
  if (status === 401 || status === 403) {
    return {
      message: 'IA temporariamente indisponível.',
      hint: 'Nossa equipe foi notificada. Tente novamente em alguns minutos.',
      status: 503,
      type: 'auth',
    }
  }

  // 429 — rate limit ou créditos
  if (status === 429) {
    const msg = String(err?.message || '').toLowerCase()
    if (msg.includes('credit') || msg.includes('balance') || msg.includes('insufficient')) {
      return {
        message: 'Limite de uso temporariamente atingido.',
        hint: 'Tente novamente em alguns minutos.',
        status: 503,
        type: 'credit',
      }
    }
    return {
      message: 'Limite de uso da IA atingido temporariamente.',
      hint: 'Tentamos automaticamente algumas vezes mas o limite continua. Aguarde 30-60 segundos e tente novamente — o limite reseta a cada minuto.',
      status: 429,
      type: 'rate_limit',
    }
  }

  // 529 ou 503 — overloaded (Anthropic side)
  if (status === 529 || status === 503) {
    return {
      message: 'IA está sobrecarregada no momento.',
      hint: 'Aguarde 30 segundos e tente novamente.',
      status: 503,
      type: 'overloaded',
    }
  }

  // 400 — request inválida (problema nosso)
  if (status === 400) {
    return {
      message: 'Não foi possível processar essa geração.',
      hint: 'Tente reformular sua sugestão ou simplificar a configuração.',
      status: 400,
      type: 'invalid',
    }
  }

  // Network / timeout
  const msg = String(err?.message || err || '').toLowerCase()
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('aborted')) {
    return {
      message: 'Conexão com a IA instável.',
      hint: 'Verifique sua internet e tente novamente.',
      status: 503,
      type: 'network',
    }
  }

  // Default
  return {
    message: 'Algo deu errado na geração.',
    hint: 'Tente novamente em alguns segundos.',
    status: 500,
    type: 'unknown',
  }
}
