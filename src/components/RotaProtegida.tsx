/**
 * Componente RotaProtegida — protege rotas que exigem autenticação administrativa
 *
 * Funcionamento:
 * - Enquanto verifica o estado da sessão no ContextoAuth, exibe uma tela de carregamento.
 * - Se o usuário estiver autenticado, renderiza o conteúdo da rota filha (children).
 * - Se não estiver autenticado, redireciona automaticamente para /admin/login.
 *
 * Uso: 
 * <RotaProtegida>
 *   <PainelAdmin />
 * </RotaProtegida>
 */
import { Navigate } from 'react-router-dom';
import { Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexto/ContextoAuth';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function RotaProtegida({ children }: Props) {
  const { usuario, carregando } = useAuth();

  // Enquanto verifica o estado de autenticação no Firebase/Provedor
  if (carregando) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primaria-600 text-white shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin text-primaria-600 dark:text-primaria-400" />
            <span>Verificando sessão...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redireciona para tela de login se o usuário não estiver autenticado
  if (!usuario) {
    return <Navigate to="/admin/login" replace />;
  }

  // Caso autenticado, renderiza os componentes filhos da rota
  return <>{children}</>;
}