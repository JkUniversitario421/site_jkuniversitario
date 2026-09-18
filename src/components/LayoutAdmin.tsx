/**
 * Componente LayoutAdmin — layout base das páginas do painel administrativo
 *
 * Contém:
 * - Barra lateral (sidebar) com navegação entre as seções do painel
 * - Barra superior com nome do admin e botão de sair
 * - Área principal onde o conteúdo de cada página é renderizado (children)
 *
 * O layout é responsivo: no mobile a barra lateral fica em uma barra superior.
 */
import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Building2, Image, LogOut, Menu, X, Bell,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/contexto/ContextoAuth';

/** Itens do menu lateral */
const MENU: { rotulo: string; caminho: string; icone: LucideIcon }[] = [
  { rotulo: 'Dashboard', caminho: '/admin/dashboard', icone: LayoutDashboard },
  { rotulo: 'Acomodações', caminho: '/admin/acomodacoes', icone: Building2 },
  { rotulo: 'Stories', caminho: '/admin/stories', icone: Image },
  { rotulo: 'Notificações', caminho: '/admin/notificacoes', icone: Bell },
];

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  /** Encerra a sessão e volta para o login */
  async function tratarSair() {
    await sair();
    navigate('/admin/login');
  }

  /** Verifica se o item do menu está ativo (rota atual) */
  function estaAtivo(caminho: string) {
    return location.pathname === caminho;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* ====== Barra superior (mobile) ====== */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primaria-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Painel Admin</span>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="rounded-lg p-2 text-gray-600 dark:text-gray-400">
          {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ====== Menu lateral (mobile overlay) ====== */}
      {menuAberto && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setMenuAberto(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute left-0 top-0 h-full w-64 bg-white p-4 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <MenuLateral estaAtivo={estaAtivo} onItemClick={() => setMenuAberto(false)} onSair={tratarSair} email={usuario?.email ?? ''} />
          </div>
        </div>
      )}

      {/* ====== Layout desktop: sidebar fixa + conteúdo ====== */}
      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:block">
          <MenuLateral estaAtivo={estaAtivo} onItemClick={() => {}} onSair={tratarSair} email={usuario?.email ?? ''} />
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ====== Componente interno: menu lateral compartilhado ======
function MenuLateral({
  estaAtivo,
  onItemClick,
  onSair,
  email,
}: {
  estaAtivo: (caminho: string) => boolean;
  onItemClick: () => void;
  onSair: () => void;
  email: string;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primaria-600 text-white">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">JK Universitário</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Painel Admin</p>
        </div>
      </div>

      {/* Itens do menu */}
      <nav className="flex-1 space-y-1">
        {MENU.map((item) => {
          const Icone = item.icone;
          return (
            <Link
              key={item.caminho}
              to={item.caminho}
              onClick={onItemClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                estaAtivo(item.caminho)
                  ? 'bg-primaria-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icone className="h-5 w-5" />
              {item.rotulo}
            </Link>
          );
        })}
      </nav>

      {/* Informações do usuário e botão sair */}
      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <p className="mb-2 truncate text-xs text-gray-500 dark:text-gray-400">{email}</p>
        <button
          onClick={onSair}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
}
