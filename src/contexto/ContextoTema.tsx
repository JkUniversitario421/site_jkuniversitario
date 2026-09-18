/**
 * Contexto de Tema — gerencia Claro / Escuro / Preto & Branco
 *
 * O usuário pode alternar entre três modos visuais:
 * 1. "claro" — tema claro padrão
 * 2. "escuro" — tema escuro (dark mode)
 * 3. "pb" — preto e branco (alto contraste para acessibilidade)
 *
 * A escolha é salva no localStorage para persistir entre sessões.
 * A classe CSS é aplicada no elemento <html> para que o Tailwind
 * e o CSS global possam reagir.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type TipoTema = 'claro' | 'escuro' | 'pb';

interface ContextoTemaType {
  tema: TipoTema;
  alternarTema: (proximo: TipoTema) => void;
}

const ContextoTema = createContext<ContextoTemaType | undefined>(undefined);

const CHAVE_ARMAZENAMENTO = 'jk-tema';

/**
 * Lê o tema salvo no localStorage ou retorna "claro" como padrão.
 */
function lerTemaSalvo(): TipoTema {
  if (typeof window === 'undefined') return 'claro';
  const salvo = localStorage.getItem(CHAVE_ARMAZENAMENTO) as TipoTema | null;
  return salvo ?? 'claro';
}

/**
 * Aplica as classes CSS no <html> de acordo com o tema escolhido.
 * - "dark" ativa o dark mode do Tailwind
 * - "pb" ativa o modo preto e branco (nossa classe customizada)
 */
function aplicarTemaNoHtml(tema: TipoTema) {
  const raiz = document.documentElement;
  // Remove todas as classes de tema antes de aplicar a nova
  raiz.classList.remove('dark', 'pb');
  if (tema === 'escuro') raiz.classList.add('dark');
  if (tema === 'pb') raiz.classList.add('pb');
}

export function ProvedorTema({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<TipoTema>('claro');

  // Ao montar, lê o tema salvo e aplica
  useEffect(() => {
    const salvo = lerTemaSalvo();
    setTema(salvo);
    aplicarTemaNoHtml(salvo);
  }, []);

  /** Troca o tema, salva no localStorage e aplica no HTML */
  function alternarTema(proximo: TipoTema) {
    setTema(proximo);
    localStorage.setItem(CHAVE_ARMAZENAMENTO, proximo);
    aplicarTemaNoHtml(proximo);
  }

  return (
    <ContextoTema.Provider value={{ tema, alternarTema }}>
      {children}
    </ContextoTema.Provider>
  );
}

/** Hook para acessar o tema atual e a função de trocar */
export function useTema() {
  const contexto = useContext(ContextoTema);
  if (!contexto) throw new Error('useTema deve ser usado dentro de <ProvedorTema>');
  return contexto;
}
