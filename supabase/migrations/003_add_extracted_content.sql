-- ============================================================
-- Migration 003 — adiciona extracted_content ao brand_dna
-- ============================================================
-- Quando o usuário cola a URL do site da marca no wizard, agora a
-- IA extrai exemplos REAIS de conteúdo (cases, ofertas, tópicos
-- recorrentes, vocabulário, tom em ação). Esses exemplos são
-- injetados como contexto nas gerações pra que o output deixe de
-- ser genérico e ganhe a especificidade da marca.
--
-- Estrutura do jsonb:
-- {
--   "source_url": "https://...",
--   "extracted_at": "2026-05-19T...",
--   "offerings": "Texto descrevendo o que a marca oferece",
--   "cases": ["Case 1 ...", "Case 2 ..."],
--   "topics": ["Tópico A", "Tópico B"],
--   "vocabulary": ["jargão1", "termo2"],
--   "tone_sample": "Parágrafo verbatim que mostra o tom real"
-- }
-- ============================================================

alter table public.brand_dna
  add column if not exists extracted_content jsonb;

-- Força reload do schema cache do PostgREST
notify pgrst, 'reload schema';
