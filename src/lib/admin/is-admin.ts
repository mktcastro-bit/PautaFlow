/**
 * Lista de emails que podem acessar /adminpainel.
 *
 * Pode ser sobrescrita via env ADMIN_EMAILS (CSV) sem precisar redeploy
 * do código, mas o fallback hardcoded garante que o owner sempre tem acesso.
 */
const HARDCODED_ADMINS = ['mktcastro@gmail.com', 'contatomktcastro21@gmail.com']

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  const merged = new Set([...HARDCODED_ADMINS.map(e => e.toLowerCase()), ...fromEnv])
  return Array.from(merged)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}
