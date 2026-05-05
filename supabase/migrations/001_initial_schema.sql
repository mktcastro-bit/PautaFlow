-- ============================================================
-- PautaFlow - Schema Multi-Tenant
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS (Tenants)
-- ============================================================
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'agency')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_subscription_status text default 'trialing',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
create table public.organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  invited_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(organization_id, user_id)
);

-- ============================================================
-- WORKSPACES (dentro de cada organização)
-- ============================================================
create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  color text default '#6366f1',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id, slug)
);

-- ============================================================
-- BRAND DNA (5 etapas do wizard)
-- ============================================================
create table public.brand_dna (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  -- Etapa 1: Identidade
  step1_brand_name text,
  step1_tagline text,
  step1_mission text,
  step1_vision text,
  step1_values text[],
  -- Etapa 2: Público-alvo
  step2_target_audience text,
  step2_age_range text,
  step2_interests text[],
  step2_pain_points text[],
  step2_persona_name text,
  -- Etapa 3: Tom de voz
  step3_tone text[] check (step3_tone <@ array['formal','informal','técnico','inspirador','divertido','educativo','provocador','empático']),
  step3_personality_traits text[],
  step3_avoid_words text[],
  step3_preferred_words text[],
  -- Etapa 4: Estética visual
  step4_primary_colors text[],
  step4_typography_style text,
  step4_visual_references text[],
  step4_aesthetic_keywords text[],
  -- Etapa 5: Posicionamento
  step5_differentiators text,
  step5_competitors text[],
  step5_market_position text,
  step5_content_pillars text[],
  current_step int default 1 check (current_step between 1 and 5),
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PAUTAS (repositório de conteúdo)
-- ============================================================
create table public.pautas (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'geral',
  platform text[] default array['instagram'],
  format text default 'post' check (format in ('post','carrossel','stories','reels','artigo','thread','newsletter')),
  status text not null default 'ideia' check (status in ('ideia','em_desenvolvimento','aprovado','publicado','arquivado')),
  tags text[] default '{}',
  priority text default 'media' check (priority in ('baixa','media','alta','urgente')),
  scheduled_date date,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- GENERATED CONTENT (histórico de gerações)
-- ============================================================
create table public.generated_content (
  id uuid primary key default uuid_generate_v4(),
  pauta_id uuid references public.pautas(id) on delete set null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  content text not null,
  prompt_used text,
  model text default 'claude-sonnet-4-6',
  platform text,
  format text,
  tokens_used int,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ============================================================
-- CALENDAR EVENTS (calendário editorial)
-- ============================================================
create table public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  pauta_id uuid references public.pautas(id) on delete set null,
  title text not null,
  description text,
  platform text[],
  scheduled_date date not null,
  scheduled_time time,
  status text default 'agendado' check (status in ('agendado','publicado','cancelado')),
  color text default '#6366f1',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PLAN LIMITS
-- ============================================================
create table public.plan_limits (
  plan text primary key,
  max_workspaces int not null,
  max_members int not null,
  max_pautas_per_month int not null,
  max_ai_generations_per_month int not null,
  can_export_import boolean default true,
  can_access_calendar boolean default true,
  can_use_brand_dna boolean default true
);

insert into public.plan_limits values
  ('starter', 1, 2, 50, 20, false, false, false),
  ('pro', 3, 5, 200, 100, true, true, true),
  ('agency', 10, 20, -1, -1, true, true, true);

-- ============================================================
-- USAGE TRACKING
-- ============================================================
create table public.usage_tracking (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  pautas_created int default 0,
  ai_generations int default 0,
  created_at timestamptz default now(),
  unique(organization_id, period_start)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_org_members_user on public.organization_members(user_id);
create index idx_org_members_org on public.organization_members(organization_id);
create index idx_workspaces_org on public.workspaces(organization_id);
create index idx_pautas_workspace on public.pautas(workspace_id);
create index idx_pautas_status on public.pautas(status);
create index idx_pautas_category on public.pautas(category);
create index idx_pautas_scheduled on public.pautas(scheduled_date);
create index idx_generated_workspace on public.generated_content(workspace_id);
create index idx_calendar_workspace on public.calendar_events(workspace_id);
create index idx_calendar_date on public.calendar_events(scheduled_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.workspaces enable row level security;
alter table public.brand_dna enable row level security;
alter table public.pautas enable row level security;
alter table public.generated_content enable row level security;
alter table public.calendar_events enable row level security;
alter table public.usage_tracking enable row level security;

-- Helper: verifica se user é membro da organização
create or replace function public.is_org_member(org_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

-- Helper: verifica se user tem acesso ao workspace
create or replace function public.has_workspace_access(ws_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.workspaces w
    join public.organization_members om on om.organization_id = w.organization_id
    where w.id = ws_id and om.user_id = auth.uid()
  );
$$;

-- Policies: organizations
create policy "members can view their org" on public.organizations
  for select using (public.is_org_member(id));

create policy "owners can update org" on public.organizations
  for update using (
    exists (
      select 1 from public.organization_members
      where organization_id = id and user_id = auth.uid() and role = 'owner'
    )
  );

-- Policies: organization_members
create policy "members can view org members" on public.organization_members
  for select using (public.is_org_member(organization_id));

create policy "admins can manage members" on public.organization_members
  for all using (
    exists (
      select 1 from public.organization_members
      where organization_id = organization_members.organization_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- Policies: workspaces
create policy "members can view workspaces" on public.workspaces
  for select using (public.is_org_member(organization_id));

create policy "admins can manage workspaces" on public.workspaces
  for all using (
    exists (
      select 1 from public.organization_members
      where organization_id = workspaces.organization_id
        and user_id = auth.uid()
        and role in ('owner', 'admin')
    )
  );

-- Policies: brand_dna
create policy "workspace members can view brand dna" on public.brand_dna
  for select using (public.has_workspace_access(workspace_id));

create policy "workspace members can manage brand dna" on public.brand_dna
  for all using (public.has_workspace_access(workspace_id));

-- Policies: pautas
create policy "workspace members can view pautas" on public.pautas
  for select using (public.has_workspace_access(workspace_id));

create policy "workspace members can manage pautas" on public.pautas
  for all using (public.has_workspace_access(workspace_id));

-- Policies: generated_content
create policy "workspace members can view content" on public.generated_content
  for select using (public.has_workspace_access(workspace_id));

create policy "workspace members can create content" on public.generated_content
  for insert with check (public.has_workspace_access(workspace_id));

-- Policies: calendar_events
create policy "workspace members can view calendar" on public.calendar_events
  for select using (public.has_workspace_access(workspace_id));

create policy "workspace members can manage calendar" on public.calendar_events
  for all using (public.has_workspace_access(workspace_id));

-- Policies: usage_tracking (somente service role escreve)
create policy "members can view usage" on public.usage_tracking
  for select using (public.is_org_member(organization_id));

-- ============================================================
-- TRIGGERS - updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger trg_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.handle_updated_at();

create trigger trg_brand_dna_updated_at
  before update on public.brand_dna
  for each row execute function public.handle_updated_at();

create trigger trg_pautas_updated_at
  before update on public.pautas
  for each row execute function public.handle_updated_at();

create trigger trg_calendar_updated_at
  before update on public.calendar_events
  for each row execute function public.handle_updated_at();

-- ============================================================
-- FUNÇÃO: criar org + workspace padrão após signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_org_id uuid;
  v_workspace_id uuid;
  v_org_slug text;
begin
  v_org_slug := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'organization_name', split_part(new.email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  ));

  insert into public.organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'organization_name', split_part(new.email, '@', 1)),
    v_org_slug || '-' || substr(new.id::text, 1, 8)
  )
  returning id into v_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org_id, new.id, 'owner');

  insert into public.workspaces (organization_id, name, slug, created_by)
  values (v_org_id, 'Principal', 'principal', new.id)
  returning id into v_workspace_id;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
