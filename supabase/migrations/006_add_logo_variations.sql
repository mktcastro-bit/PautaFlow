-- ============================================================
-- Migration 006 — adiciona variações alternativas de logomarca
-- ============================================================
-- Hoje o brand_dna armazena apenas uma logo principal em
-- step1_logo_url. Marcas costumam ter múltiplas variações
-- (versão clara, escura, símbolo, monocromática etc), úteis
-- conforme o fundo da arte ou a peça.
--
-- step1_logo_alts é um array JSON de variações alternativas
-- (a logo principal continua em step1_logo_url). Cada item:
--   { "url": "https://...", "label": "Versão clara" }
--
-- O usuário pode "tornar principal" qualquer alternativa no
-- wizard — isso troca o conteúdo de step1_logo_url com a
-- variação selecionada. Depois da geração, o painel do
-- editor mostra todas as variações disponíveis para
-- escolha pontual numa arte específica.
-- ============================================================

alter table public.brand_dna
  add column if not exists step1_logo_alts jsonb default '[]'::jsonb;

notify pgrst, 'reload schema';
