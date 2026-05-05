# PautaFlow — Guia de Setup

## Stack
- **Frontend**: Next.js 14 (App Router)
- **Banco**: Supabase (PostgreSQL + Auth + RLS)
- **IA**: Anthropic Claude (claude-sonnet-4-6)
- **Pagamentos**: Stripe (Checkout + Portal + Webhooks)
- **Deploy**: Vercel

---

## 1. Pré-requisitos

```bash
node >= 18
npm ou pnpm
```

---

## 2. Instalação

```bash
cd pautaflow
npm install
cp .env.example .env.local
```

---

## 3. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo `supabase/migrations/001_initial_schema.sql`
3. Em **Project Settings > API**, copie:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Em **Authentication > Providers**, ative **Google** (opcional)
5. Em **Authentication > URL Configuration**, adicione:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

---

## 4. Anthropic

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma API key
3. Adicione ao `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

---

## 5. Stripe

1. Crie conta em [stripe.com](https://stripe.com)
2. No Dashboard, crie 3 produtos com preços recorrentes mensais:
   - **Starter**: R$ 97/mês
   - **Pro**: R$ 197/mês
   - **Agency**: R$ 497/mês
3. Copie os Price IDs para o `.env.local`
4. Para o webhook local, instale o Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

5. Copie o webhook secret gerado para `STRIPE_WEBHOOK_SECRET`

---

## 6. Variáveis de ambiente (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

ANTHROPIC_API_KEY=sk-ant-sua-chave

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 8. Deploy na Vercel

```bash
npm install -g vercel
vercel --prod
```

Ou conecte o repositório GitHub no [vercel.com](https://vercel.com) e configure as variáveis de ambiente.

**Webhook Stripe em produção:**
- Configure o endpoint no Stripe Dashboard: `https://seu-dominio.vercel.app/api/stripe/webhook`
- Adicione os eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Estrutura do projeto

```
pautaflow/
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, register, callback
│   │   ├── (dashboard)/     # workspaces, billing
│   │   │   └── workspaces/[slug]/
│   │   │       ├── pautas/      # Repositório de pautas
│   │   │       ├── generate/    # Gerador de conteúdo IA
│   │   │       ├── brand-dna/   # Wizard 5 etapas
│   │   │       ├── calendar/    # Calendário editorial
│   │   │       └── settings/
│   │   ├── api/
│   │   │   ├── generate/    # POST /api/generate
│   │   │   ├── export/      # GET /api/export
│   │   │   ├── import/      # POST /api/import
│   │   │   └── stripe/      # checkout, portal, webhook
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── pautas/          # PautasClient, PautaModal
│   │   ├── brand-dna/       # BrandDnaWizard
│   │   ├── calendar/        # CalendarClient
│   │   └── shared/          # Sidebar, GenerateClient, BillingClient
│   ├── lib/
│   │   ├── supabase/        # client, server, middleware
│   │   ├── stripe/          # checkout, portal, webhook
│   │   └── anthropic/       # generateContent, prompts
│   └── types/               # TypeScript types
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Planos

| Feature | Starter | Pro | Agency |
|---------|---------|-----|--------|
| Workspaces | 1 | 3 | 10 |
| Membros | 2 | 5 | 20 |
| Pautas/mês | 50 | 200 | Ilimitado |
| Gerações IA/mês | 20 | 100 | Ilimitado |
| DNA da Marca | ❌ | ✅ | ✅ |
| Calendário | ❌ | ✅ | ✅ |
| Export/Import | ❌ | ✅ | ✅ |
| Preço | R$ 97/mês | R$ 197/mês | R$ 497/mês |

---

## Renomear o app

Para trocar o nome "PautaFlow":
1. `grep -r "PautaFlow" src/ --include="*.tsx" --include="*.ts"` — localize todas as ocorrências
2. Substitua pelo nome desejado
3. Atualize `metadata` em `src/app/layout.tsx`
4. Atualize o `package.json` (campo `name`)
