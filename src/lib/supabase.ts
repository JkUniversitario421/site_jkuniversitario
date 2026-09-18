/**
 * Cliente Supabase — conexão singleton com o banco de dados
 *
 * Este arquivo cria e exporta a ÚNICA instância do cliente Supabase
 * usada em toda a aplicação. Lê as variáveis de ambiente que já vêm
 * pré-configuradas no projeto.
 *
 * Como usar: importe `supabase` de qualquer arquivo:
 *   import { supabase } from '@/lib/supabase'
 */
import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente (já vêm configuradas pelo Bolt)
const urlSupabase = import.meta.env.VITE_SUPABASE_URL as string;
const chaveAnonima = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Cria o cliente singleton
export const supabase = createClient(urlSupabase, chaveAnonima, {
  auth: {
    // Mantém a sessão persistente entre recargas
    persistSession: true,
    // Não recarrega a página ao detectar mudança de sessão
    autoRefreshToken: true,
  },
});
