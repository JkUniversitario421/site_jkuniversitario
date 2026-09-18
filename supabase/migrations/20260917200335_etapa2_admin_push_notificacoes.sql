/*
# Segunda etapa: RLS restrito para admin + tabelas de notificações push

## Descrição
Esta migração prepara o banco para a área administrativa protegida:
1. Restringe a escrita (INSERT/UPDATE/DELETE) nas tabelas `acomodacoes` e `stories`
   para apenas usuários autenticados (admin). A leitura continua pública (anon).
2. Cria a tabela `inscricoes_push` para armazenar as inscrições de notificação push
   dos dispositivos que instalaram o PWA.
3. Cria a tabela `notificacoes` para registrar o histórico de notificações enviadas.

## Tabelas criadas

### `inscricoes_push`
- `id` (uuid, chave primária)
- `endpoint` (text, URL do endpoint push do navegador)
- `chaves_p256dh` (text, chave pública de criptografia)
- `chaves_auth` (text, chave de autenticação de criptografia)
- `criado_em` (timestamptz)

### `notificacoes`
- `id` (uuid, chave primária)
- `titulo` (text, título da notificação)
- `corpo` (text, corpo/mensagem da notificação)
- `link` (text, link opcional ao clicar na notificação)
- `enviada` (boolean, se foi enviada)
- `criado_em` (timestamptz)

## Segurança
- `acomodacoes` e `stories`: SELECT continua público (anon + authenticated).
  INSERT/UPDATE/DELETE agora restrito a authenticated (admin logado).
- `inscricoes_push`: SELECT/INSERT públicos (qualquer dispositivo pode inscrever-se).
  UPDATE/DELETE apenas authenticated (admin).
- `notificacoes`: SELECT público (qualquer um pode ver histórico).
  INSERT/UPDATE/DELETE apenas authenticated (admin).
*/

-- ============================================================
-- 1. RESTRINGIR ESCRITA EM ACOMODACOES (SELECT continua público)
-- ============================================================
-- Remove as políticas antigas de escrita pública
DROP POLICY IF EXISTS "anon_insert_acomodacoes" ON acomodacoes;
DROP POLICY IF EXISTS "anon_update_acomodacoes" ON acomodacoes;
DROP POLICY IF EXISTS "anon_delete_acomodacoes" ON acomodacoes;

-- Cria novas políticas restritas a authenticated (admin)
CREATE POLICY "admin_insert_acomodacoes" ON acomodacoes FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_acomodacoes" ON acomodacoes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_acomodacoes" ON acomodacoes FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 2. RESTRINGIR ESCRITA EM STORIES (SELECT continua público)
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_stories" ON stories;
DROP POLICY IF EXISTS "anon_update_stories" ON stories;
DROP POLICY IF EXISTS "anon_delete_stories" ON stories;

CREATE POLICY "admin_insert_stories" ON stories FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_stories" ON stories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_delete_stories" ON stories FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 3. TABELA: inscricoes_push
-- ============================================================
CREATE TABLE IF NOT EXISTS inscricoes_push (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  chaves_p256dh text NOT NULL,
  chaves_auth text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE inscricoes_push ENABLE ROW LEVEL SECURITY;

-- Qualquer dispositivo pode inscrever-se (inserir sua inscrição)
DROP POLICY IF EXISTS "anon_insert_inscricoes_push" ON inscricoes_push;
CREATE POLICY "anon_insert_inscricoes_push" ON inscricoes_push FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Admin pode ver todas as inscrições
DROP POLICY IF EXISTS "admin_select_inscricoes_push" ON inscricoes_push;
CREATE POLICY "admin_select_inscricoes_push" ON inscricoes_push FOR SELECT
  TO authenticated USING (true);

-- Admin pode atualizar/remover inscrições
DROP POLICY IF EXISTS "admin_update_inscricoes_push" ON inscricoes_push;
CREATE POLICY "admin_update_inscricoes_push" ON inscricoes_push FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_inscricoes_push" ON inscricoes_push;
CREATE POLICY "admin_delete_inscricoes_push" ON inscricoes_push FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 4. TABELA: notificacoes
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  corpo text NOT NULL,
  link text,
  enviada boolean NOT NULL DEFAULT false,
  criado_em timestamptz DEFAULT now()
);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Leitura pública do histórico de notificações
DROP POLICY IF EXISTS "anon_select_notificacoes" ON notificacoes;
CREATE POLICY "anon_select_notificacoes" ON notificacoes FOR SELECT
  TO anon, authenticated USING (true);

-- Apenas admin (authenticated) pode criar/editar/remover notificações
DROP POLICY IF EXISTS "admin_insert_notificacoes" ON notificacoes;
CREATE POLICY "admin_insert_notificacoes" ON notificacoes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_notificacoes" ON notificacoes;
CREATE POLICY "admin_update_notificacoes" ON notificacoes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_notificacoes" ON notificacoes;
CREATE POLICY "admin_delete_notificacoes" ON notificacoes FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- 5. STORAGE BUCKET para uploads de fotos (admin)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-jk', 'fotos-jk', true)
ON CONFLICT (id) DO NOTHING;

-- Política: leitura pública das fotos
DROP POLICY IF EXISTS "anon_read_fotos_jk" ON storage.objects;
CREATE POLICY "anon_read_fotos_jk" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'fotos-jk');

-- Política: apenas admin (authenticated) pode subir fotos
DROP POLICY IF EXISTS "admin_upload_fotos_jk" ON storage.objects;
CREATE POLICY "admin_upload_fotos_jk" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos-jk');

-- Política: apenas admin pode remover fotos
DROP POLICY IF EXISTS "admin_delete_fotos_jk" ON storage.objects;
CREATE POLICY "admin_delete_fotos_jk" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'fotos-jk');

-- Política: apenas admin pode atualizar fotos
DROP POLICY IF EXISTS "admin_update_fotos_jk" ON storage.objects;
CREATE POLICY "admin_update_fotos_jk" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'fotos-jk') WITH CHECK (bucket_id = 'fotos-jk');
