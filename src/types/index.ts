export type Plan = 'starter' | 'pro' | 'agency'
export type OrgRole = 'owner' | 'admin' | 'member'
export type PautaStatus = 'ideia' | 'em_desenvolvimento' | 'aprovado' | 'publicado' | 'arquivado'
export type PautaFormat = 'post' | 'carrossel' | 'stories' | 'reels' | 'artigo' | 'thread' | 'newsletter'
export type PautaPriority = 'baixa' | 'media' | 'alta' | 'urgente'
export type CalendarStatus = 'agendado' | 'publicado' | 'cancelado'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_status: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: OrgRole
  created_at: string
}

export interface Workspace {
  id: string
  organization_id: string
  name: string
  slug: string
  description: string | null
  color: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface BrandDNA {
  id: string
  workspace_id: string
  step1_brand_name: string | null
  step1_tagline: string | null
  step1_mission: string | null
  step1_vision: string | null
  step1_values: string[] | null
  step2_target_audience: string | null
  step2_age_range: string | null
  step2_interests: string[] | null
  step2_pain_points: string[] | null
  step2_persona_name: string | null
  step3_tone: string[] | null
  step3_personality_traits: string[] | null
  step3_avoid_words: string[] | null
  step3_preferred_words: string[] | null
  step4_primary_colors: string[] | null
  step4_typography_style: string | null
  step4_visual_references: string[] | null
  step4_aesthetic_keywords: string[] | null
  step5_differentiators: string | null
  step5_competitors: string[] | null
  step5_market_position: string | null
  step5_content_pillars: string[] | null
  current_step: number
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Pauta {
  id: string
  workspace_id: string
  title: string
  description: string | null
  category: string
  platform: string[]
  format: PautaFormat
  status: PautaStatus
  tags: string[]
  priority: PautaPriority
  scheduled_date: string | null
  published_at: string | null
  created_by: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  id: string
  pauta_id: string | null
  workspace_id: string
  content: string
  prompt_used: string | null
  model: string
  platform: string | null
  format: string | null
  tokens_used: number | null
  created_by: string | null
  created_at: string
}

export interface CalendarEvent {
  id: string
  workspace_id: string
  pauta_id: string | null
  title: string
  description: string | null
  platform: string[] | null
  scheduled_date: string
  scheduled_time: string | null
  status: CalendarStatus
  color: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PlanLimits {
  plan: Plan
  max_workspaces: number
  max_members: number
  max_pautas_per_month: number
  max_ai_generations_per_month: number
  can_export_import: boolean
  can_access_calendar: boolean
  can_use_brand_dna: boolean
}

export const PLAN_DETAILS: Record<Plan, { name: string; price: number; description: string; features: string[] }> = {
  starter: {
    name: 'Starter',
    price: 97,
    description: 'Para criadores e freelancers',
    features: [
      '1 workspace',
      'Até 2 membros',
      '50 pautas/mês',
      '20 gerações de IA/mês',
      'Repositório de pautas',
    ],
  },
  pro: {
    name: 'Pro',
    price: 197,
    description: 'Para equipes de marketing',
    features: [
      '3 workspaces',
      'Até 5 membros',
      '200 pautas/mês',
      '100 gerações de IA/mês',
      'DNA da Marca completo',
      'Calendário editorial',
      'Export/Import JSON',
    ],
  },
  agency: {
    name: 'Agency',
    price: 497,
    description: 'Para agências e grandes equipes',
    features: [
      '10 workspaces',
      'Até 20 membros',
      'Pautas ilimitadas',
      'IA ilimitada',
      'Todos os recursos Pro',
      'Suporte prioritário',
    ],
  },
}

export interface PautaFilters {
  status?: PautaStatus
  category?: string
  platform?: string
  format?: PautaFormat
  priority?: PautaPriority
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface ExportData {
  version: string
  exported_at: string
  workspace_name: string
  brand_dna?: BrandDNA
  pautas: Pauta[]
  calendar_events: CalendarEvent[]
}
