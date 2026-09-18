/**
 * Componente RotaProtegida — protege rotas que exigem login de admin
 *
 * Funcionamento:
 * - Se o usuário estiver logado, renderiza o conteúdo da rota.
 * - Se não estiver logado, redireciona para /admin/login.
 * - Enquanto verifica a sessão inicial, mostra uma tela de carregamento.
 *
 * Uso: <RotaProtegida><Dashboard /></RotaProtegida>
 */
import { Navigate } from 'react-router-dom';
import { Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexto/ContextoAuth';
import type { ReactNode } from 'react';

export default function RotaProtegida({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth();

  // Enquanto verifica a sessão: mostra tela de carregamento
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primaria-600 text-white">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verificando sessão...
          </div>
        </div>
      </div>
    );
  }

  // Se não há usuário logado: redireciona para o login
  if (!usuario) {
    return <Navigate to="/admin/login" replace />;
  }

  // Usuário logado: renderiza o conteúdo protegido
  return <>{children}</>;
}
