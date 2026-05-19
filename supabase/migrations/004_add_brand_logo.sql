-- ============================================================
-- Migration 004 — adiciona logo da marca ao brand_dna
-- ============================================================
-- A logomarca da marca (PNG/SVG transparente) é parte da
-- identidade visual e deve ser aplicada automaticamente em
-- toda arte gerada. Antes, o usuário tinha que fazer upload
-- da logo a cada geração no painel da arte.
--
-- Agora: upload uma vez no wizard de DNA → toda arte usa.
-- O usuário ainda pode sobrescrever pontualmente na tela de arte.
-- ============================================================

alter table public.brand_dna
  add column if not exists step1_logo_url text;

notify pgrst, 'reload schema';
