/*
# Criar tabelas de acomodações e stories (single-tenant, sem auth)

## Descrição
Cria as tabelas necessárias para a plataforma JK Universitário:
1. `acomodacoes` - armazena as 16 unidades habitacionais + áreas comuns
2. `stories` - armazena os destaques/stories diários postados pelo administrador

## Tabelas criadas

### `acomodacoes`
- `id` (uuid, chave primária)
- `nome` (text, nome da acomodação, ex: "Quarto 01")
- `tipo` (text, tipo: 'quarto', 'jk', 'kitnet', 'apartamento', 'area_comum')
- `descricao` (text, descrição detalhada)
- `valor` (numeric, valor mensal em reais; NULL para áreas comuns)
- `status` (text, status: 'disponivel', 'ocupado', 'reservado')
- `fotos` (jsonb, array de URLs de fotos)
- `comodidades` (jsonb, array de comodidades)
- `ordem` (integer, ordem de exibição)
- `criado_em` (timestamptz, data de criação)

### `stories`
- `id` (uuid, chave primária)
- `titulo` (text, título do story/destaque)
- `imagem` (text, URL da imagem)
- `descricao` (text, descrição do story)
- `link` (text, link opcional ao clicar)
- `ativo` (boolean, se o story está visível)
- `criado_em` (timestamptz, data de criação)

## Segurança
- RLS habilitado em ambas as tabelas.
- Acesso público (anon + authenticated) para SELECT, INSERT, UPDATE, DELETE,
  pois trata-se de um app single-tenant sem autenticação nesta etapa.
  O administrador fará a gestão diretamente pelo painel.
*/

-- ============================================================
-- TABELA: acomodacoes
-- ============================================================
CREATE TABLE IF NOT EXISTS acomodacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('quarto', 'jk', 'kitnet', 'apartamento', 'area_comum')),
  descricao text NOT NULL DEFAULT '',
  valor numeric,
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'ocupado', 'reservado')),
  fotos jsonb NOT NULL DEFAULT '[]'::jsonb,
  comodidades jsonb NOT NULL DEFAULT '[]'::jsonb,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE acomodacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_acomodacoes" ON acomodacoes;
CREATE POLICY "anon_select_acomodacoes" ON acomodacoes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_acomodacoes" ON acomodacoes;
CREATE POLICY "anon_insert_acomodacoes" ON acomodacoes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_acomodacoes" ON acomodacoes;
CREATE POLICY "anon_update_acomodacoes" ON acomodacoes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_acomodacoes" ON acomodacoes;
CREATE POLICY "anon_delete_acomodacoes" ON acomodacoes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- TABELA: stories
-- ============================================================
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  imagem text NOT NULL,
  descricao text DEFAULT '',
  link text,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stories" ON stories;
CREATE POLICY "anon_select_stories" ON stories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stories" ON stories;
CREATE POLICY "anon_insert_stories" ON stories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stories" ON stories;
CREATE POLICY "anon_update_stories" ON stories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stories" ON stories;
CREATE POLICY "anon_delete_stories" ON stories FOR DELETE
  TO anon, authenticated USING (true);

-- Índice para ordenação das acomodações
CREATE INDEX IF NOT EXISTS idx_acomodacoes_ordem ON acomodacoes(ordem);
-- Índice para buscar apenas stories ativos
CREATE INDEX IF NOT EXISTS idx_stories_ativo ON stories(ativo) WHERE ativo = true;
