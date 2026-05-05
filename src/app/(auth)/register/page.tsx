'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    organization_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { organization_name: form.organization_name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/workspaces')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Criar sua conta</h1>
        <p className="text-sm text-muted-foreground mt-1">
          14 dias grátis, sem cartão de crédito.{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Já tenho conta
          </Link>
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="organization_name" className="text-sm font-medium">
            Nome da empresa / marca
          </label>
          <input
            id="organization_name"
            name="organization_name"
            type="text"
            value={form.organization_name}
            onChange={handleChange}
            placeholder="Minha Agência"
            required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar senha</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Criando conta...' : 'Começar grátis'}
        </button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Ao criar uma conta, você concorda com os{' '}
        <Link href="/terms" className="underline">Termos de Uso</Link>{' '}
        e a{' '}
        <Link href="/privacy" className="underline">Política de Privacidade</Link>
      </p>
    </div>
  )
}
