-- ============================================================
-- Migration 005 — adiciona campo de site/handle ao brand_dna
-- ============================================================
-- O rodapé das artes geradas exibia um URL "inventado" no formato
-- <brand_name>.com.br, o que não correspondia ao site real da marca
-- e, quando o nome estava vazio, virava o literal "marca.com.br".
--
-- Agora: o usuário preenche o campo no wizard de DNA (opcional).
-- Quando vazio, o rodapé não exibe nada — sem fallback chutado.
-- Aceita URL, @ do Instagram, ou qualquer texto curto que a marca
-- queira ver impresso na arte.
-- ============================================================

alter table public.brand_dna
  add column if not exists step1_website text;

notify pgrst, 'reload schema';
