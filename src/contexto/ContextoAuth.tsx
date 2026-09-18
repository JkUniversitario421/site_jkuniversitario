/**
 * Contexto de Autenticação — gerencia login, sessão e logout do admin
 *
 * Funcionamento:
 * 1. No momento que o app carrega, verifica se já existe uma sessão salva.
 * 2. Escuta mudanças de estado de autenticação (login/logout) em tempo real.
 * 3. Expõe funções de entrar (signIn), cadastrar (signUp) e sair (signOut).
 * 4. Expõe `usuario` (dados do admin) e `carregando` (estado inicial).
 *
 * Usa o Supabase Authentication com e-mail e senha.
 * O cadastro cria uma conta que fica disponível para login imediatato
 * (confirmação por e-mail fica desativada por padrão no Supabase).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface ContextoAuthType {
  /** Usuário atualmente logado (null se ninguém estiver logado) */
  usuario: User | null;
  /** True enquanto verifica a sessão inicial ao carregar o app */
  carregando: boolean;
  /** Faz login com e-mail e senha */
  entrar: (email: string, senha: string) => Promise<{ erro: string | null }>;
  /** Cadastra um novo administrador */
  cadastrar: (email: string, senha: string) => Promise<{ erro: string | null }>;
  /** Encerra a sessão atual */
  sair: () => Promise<void>;
}

const ContextoAuth = createContext<ContextoAuthType | undefined>(undefined);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  /**
   * Ao montar: verifica se já existe uma sessão ativa.
   * Também registra um listener para detectar login/logout em tempo real.
   *
   * IMPORTANTE: o callback do onAuthStateChange roda de forma síncrona.
   * Qualquer operação assíncrona dentro dele deve ser envolvida em
   * uma IIFE async para evitar deadlock (regra do Supabase).
   */
  useEffect(() => {
    // Verifica sessão existente
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ?? null);
      setCarregando(false);
    });

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      (async () => {
        setUsuario(session?.user ?? null);
      })();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  /** Faz login com e-mail e senha */
  async function entrar(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { erro: traduzirErroAuth(error.message) };
    return { erro: null };
  }

  /** Cadastra um novo administrador com e-mail e senha */
  async function cadastrar(email: string, senha: string) {
    const { error } = await supabase.auth.signUp({ email, password: senha });
    if (error) return { erro: traduzirErroAuth(error.message) };
    return { erro: null };
  }

  /** Encerra a sessão atual */
  async function sair() {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  return (
    <ContextoAuth.Provider value={{ usuario, carregando, entrar, cadastrar, sair }}>
      {children}
    </ContextoAuth.Provider>
  );
}

/** Hook para acessar o contexto de autenticação */
export function useAuth() {
  const contexto = useContext(ContextoAuth);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de <ProvedorAuth>');
  return contexto;
}

/**
 * Traduz as mensagens de erro do Supabase para português,
 * para que o admin veja mensagens claras e não técnicas.
 */
function traduzirErroAuth(mensagem: string): string {
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (mensagem.includes('User already registered')) return 'Este e-mail já está cadastrado.';
  if (mensagem.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (mensagem.includes('Unable to validate email')) return 'E-mail inválido.';
  return 'Ocorreu um erro. Tente novamente.';
}
