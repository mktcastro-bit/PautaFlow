/**
 * Retry com exponential backoff para chamadas Anthropic.
 *
 * Faz retry automático quando a API retorna:
 *  - 429 (rate_limit) — limite por minuto da conta
 *  - 529 / 503 (overloaded) — sobrecarga temporária do lado da Anthropic
 *  - erros de rede (timeout, fetch failed, ECONNRESET)
 *
 * NÃO faz retry em:
 *  - 400 (request inválida) — corrigir prompt, retry só repete o erro
 *  - 401/403 (auth) — chave errada, retry não vai resolver
 *  - 500/502 desconhecidos sem retry-after — pode ser bug nosso
 *
 * Quando a Anthropic envia o header `retry-after` (segundos), respeitamos.
 * Caso contrário, backoff exponencial: 2s → 5s → 10s.
 */

interface RetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
  onRetry?: (attempt: number, delayMs: number, err: any) => void
}

const DEFAULT_DELAYS_MS = [2000, 5000, 10000]

function isRetryable(err: any): boolean {
  const status: number | undefined = err?.status
  if (status === 429) return true
  if (status === 529 || status === 503) return true

  // Network / timeout
  const msg = String(err?.message || err || '').toLowerCase()
  if (
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('econnreset') ||
    msg.includes('socket hang up')
  ) return true

  return false
}

function getRetryAfterMs(err: any): number | null {
  // Anthropic SDK expõe headers via err.headers (axios style) ou err.responseHeaders
  const headers = err?.headers || err?.responseHeaders || err?.response?.headers
  if (!headers) return null

  // Tenta diferentes formas (Map, plain object, fetch-style)
  const raw =
    (typeof headers.get === 'function' && headers.get('retry-after')) ||
    headers['retry-after'] ||
    headers['Retry-After']

  if (!raw) return null
  const seconds = parseInt(String(raw), 10)
  if (Number.isFinite(seconds) && seconds > 0) {
    // Cap em 30s pra não travar request por muito tempo
    return Math.min(seconds, 30) * 1000
  }
  return null
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3
  const onRetry = opts.onRetry

  let lastErr: any
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err

      // Não é retryable → joga já
      if (!isRetryable(err)) throw err

      // Última tentativa → joga
      if (attempt === maxAttempts) throw err

      // Calcula delay: prioriza retry-after header
      const headerDelay = getRetryAfterMs(err)
      const fallbackDelay = DEFAULT_DELAYS_MS[attempt - 1] ?? 10000
      const delayMs = headerDelay ?? fallbackDelay

      // Log + callback opcional
      console.warn(
        `[anthropic-retry] tentativa ${attempt}/${maxAttempts} falhou (status=${err?.status}). ` +
        `Aguardando ${delayMs}ms antes da próxima.`
      )
      onRetry?.(attempt, delayMs, err)

      await new Promise(r => setTimeout(r, delayMs))
    }
  }

  // Não deveria chegar aqui, mas por garantia:
  throw lastErr
}
