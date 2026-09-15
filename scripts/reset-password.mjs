import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const USER_ID = '4f3536d5-a635-423e-9273-b03624e5582d'
const NEW_PASSWORD = 'roberta2026'

const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
  password: NEW_PASSWORD,
})

if (error) {
  console.error('Erro:', error.message)
  process.exit(1)
}

console.log('✅ Senha redefinida com sucesso')
console.log('email:        ', data.user.email)
console.log('updated_at:   ', data.user.updated_at)
console.log('\nCredenciais:')
console.log('  email:    roberta@marinebox.com.br')
console.log('  senha:    roberta2026')
