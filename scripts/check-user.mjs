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

const EMAIL = 'roberta@marinebox.com.br'

const { data: { users }, error: e1 } = await supabase.auth.admin.listUsers({ perPage: 1000 })
if (e1) { console.error('listUsers:', e1); process.exit(1) }

const user = users.find(u => u.email?.toLowerCase() === EMAIL.toLowerCase())
if (!user) { console.log('Usuário não encontrado'); process.exit(0) }

console.log('=== USUÁRIO ===')
console.log('id:           ', user.id)
console.log('email:        ', user.email)
console.log('created_at:   ', user.created_at)
console.log('confirmed:    ', user.email_confirmed_at ? 'sim' : 'NÃO')
console.log('last_sign_in: ', user.last_sign_in_at || '(nunca)')

const { data: memberships } = await supabase
  .from('organization_members')
  .select('role, organization_id, organizations(id, name, slug)')
  .eq('user_id', user.id)

console.log('\n=== ORGANIZAÇÕES ===')
for (const m of memberships || []) {
  console.log(`- ${m.organizations?.name} (${m.organizations?.slug}) — role: ${m.role}`)

  const { count: ownerCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', m.organization_id)
    .eq('role', 'owner')

  const { count: totalCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', m.organization_id)

  console.log(`  membros totais: ${totalCount} | owners: ${ownerCount}`)
}

const { count: pautasCount } = await supabase
  .from('pautas')
  .select('*', { count: 'exact', head: true })
  .eq('created_by', user.id)

const { count: workspacesCount } = await supabase
  .from('workspaces')
  .select('*', { count: 'exact', head: true })
  .eq('created_by', user.id)

console.log(`\n=== CONTEÚDO CRIADO ===`)
console.log(`workspaces: ${workspacesCount} | pautas: ${pautasCount}`)
