/**
 * Componente Cabecalho — barra superior fixa com logo, troca de tema, notificações e instalação PWA
 *
 * Contém:
 * - Logo/nome da pousada com ícone
 * - Botão de ativar notificações push
 * - Botão de alternância de tema (Claro / Escuro / P&B)
 * - Botão "Instalar Aplicativo" (PWA) — só aparece se o navegador permitir
 *
 * O cabeçalho fica fixo no topo (sticky) e tem fundo translúcido com blur
 * para um efeito moderno de aplicativo nativo.
 */
import { Sun, Moon, Contrast, Download, GraduationCap } from 'lucide-react';
import { useTema, type TipoTema } from '@/contexto/ContextoTema';
import { usePWA } from '@/hooks/usePWA';
import BotaoNotificacoes from './BotaoNotificacoes';

/** Ícone e rótulo para cada tema */
const TEMAS: { valor: TipoTema; icone: typeof Sun; rotulo: string }[] = [
  { valor: 'claro', icone: Sun, rotulo: 'Claro' },
  { valor: 'escuro', icone: Moon, rotulo: 'Escuro' },
  { valor: 'pb', icone: Contrast, rotulo: 'P&B' },
];

export default function Cabecalho() {
  const { tema, alternarTema } = useTema();
  const { instalavel, instalarApp } = usePWA();

  /** Cicla entre os três temas ao clicar no botão */
  function proximoTema() {
    const ordem: TipoTema[] = ['claro', 'escuro', 'pb'];
    const indiceAtual = ordem.indexOf(tema);
    const proximo = ordem[(indiceAtual + 1) % ordem.length];
    alternarTema(proximo);
  }

  // Encontra o ícone do tema atual
  const temaAtual = TEMAS.find((t) => t.valor === tema) ?? TEMAS[0];
  const IconeTema = temaAtual.icone;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg dark:border-gray-800/60 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ===== Logo e nome da pousada ===== */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primaria-600 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold leading-tight text-gray-900 dark:text-white">
              JK Universitário
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pousada para Estudantes UFRGS</p>
          </div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white sm:hidden">JK</h1>
        </div>

        {/* ===== Ações: notificações + tema + instalar PWA ===== */}
        <div className="flex items-center gap-2">
          {/* Botão de ativar notificações push */}
          <BotaoNotificacoes />

          {/* Botão de instalação do PWA — só aparece se o navegador permitir */}
          {instalavel && (
            <button
              onClick={instalarApp}
              className="inline-flex items-center gap-1.5 rounded-lg bg-secundaria-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-secundaria-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-secundaria-400 sm:text-sm"
              aria-label="Instalar aplicativo"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Instalar App</span>
              <span className="sm:hidden">Instalar</span>
            </button>
          )}

          {/* Botão de alternância de tema — cicla entre Claro, Escuro e P&B */}
          <button
            onClick={proximoTema}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primaria-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label={`Tema atual: ${temaAtual.rotulo}. Clique para alternar.`}
            title={`Tema: ${temaAtual.rotulo}`}
          >
            <IconeTema className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{temaAtual.rotulo}</span>
          </button>
        </div>
      </div>
    </header>
  );
}