/**
 * Contexto de Autenticação — gerencia login, sessão e logout do admin
 *
 * Funcionamento:
 * 1. No momento que o app carrega, verifica se já existe uma sessão salva via Firebase.
 * 2. Escuta mudanças de estado de autenticação (login/logout) em tempo real.
 * 3. Expõe funções de entrar (signIn), cadastrar (signUp) e sair (signOut).
 * 4. Expõe `usuario` (dados do admin) e `carregando` (estado inicial).
 *
 * Usa o Firebase Authentication com e-mail e senha.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
   * Escuta mudanças no estado de autenticação do Firebase.
   * Dispara automaticamente ao iniciar o app e ao realizar login/logout.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioAtual) => {
      setUsuario(usuarioAtual);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  /** Faz login com e-mail e senha no Firebase */
  async function entrar(email: string, senha: string) {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      return { erro: null };
    } catch (error: any) {
      return { erro: traduzirErroAuth(error.code || error.message) };
    }
  }

  /** Cadastra um novo administrador com e-mail e senha no Firebase */
  async function cadastrar(email: string, senha: string) {
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      return { erro: null };
    } catch (error: any) {
      return { erro: traduzirErroAuth(error.code || error.message) };
    }
  }

  /** Encerra a sessão atual */
  async function sair() {
    await signOut(auth);
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
 * Traduz os códigos de erro do Firebase Auth para português,
 * para que o admin veja mensagens claras e amigáveis.
 */
function traduzirErroAuth(codigoOuMensagem: string): string {
  if (codigoOuMensagem.includes('auth/invalid-credential') || codigoOuMensagem.includes('auth/user-not-found') || codigoOuMensagem.includes('auth/wrong-password')) {
    return 'E-mail ou senha incorretos.';
  }
  if (codigoOuMensagem.includes('auth/email-already-in-use')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (codigoOuMensagem.includes('auth/weak-password')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (codigoOuMensagem.includes('auth/invalid-email')) {
    return 'E-mail inválido.';
  }
  return 'Ocorreu um erro. Tente novamente.';
}