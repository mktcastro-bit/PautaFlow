-- ============================================================
-- Migration 002 — adiciona step1_offerings ao brand_dna
-- ============================================================
-- O wizard de DNA da marca tem o campo "Produtos / Serviços oferecidos"
-- na etapa 1, mas a coluna não existia no schema inicial.
-- Sintoma sem esta migration:
--   "Could not find the 'step1_offerings' column of 'brand_dna' in the schema cache"
-- ============================================================

alter table public.brand_dna
  add column if not exists step1_offerings text;

-- Força reload do schema cache do PostgREST (Supabase) pra que a
-- nova coluna apareça imediatamente nas queries via REST.
notify pgrst, 'reload schema';
