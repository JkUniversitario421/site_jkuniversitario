/**
 * Componente BotaoNotificacoes — botão para ativar notificações push no site público
 *
 * Mostra um sino na barra superior. Ao clicar, pede permissão do navegador
 * e inscreve o dispositivo para receber notificações push.
 * Quando já inscrito, mostra um ícone de "sino ativo".
 *
 * O botão só aparece se o navegador suportar notificações push.
 */
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { useNotificacoesPush } from '@/hooks/useNotificacoesPush';

export default function BotaoNotificacoes() {
  const { permissao, inscrito, carregando, inscrever } = useNotificacoesPush();

  // Não mostra o botão se o navegador não suporta notificações
  if (permissao === 'unsupported' || permissao === 'denied') return null;

  // Se já está inscrito, mostra o sino ativo (não clicável)
  if (inscrito || permissao === 'granted') {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 rounded-lg bg-primaria-100 px-3 py-2 text-xs font-semibold text-primaria-700 dark:bg-primaria-900/30 dark:text-primaria-400"
        title="Notificações ativadas"
      >
        <BellRing className="h-4 w-4" />
        <span className="hidden sm:inline">Notif. Ativas</span>
      </button>
    );
  }

  return (
    <button
      onClick={inscrever}
      disabled={carregando}
      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200 active:scale-95 disabled:opacity-60 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      title="Ativar notificações push"
    >
      {carregando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Ativar Notif.</span>
    </button>
  );
}
