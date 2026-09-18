/**
 * Hook usePWA — detecta e controla a instalação do aplicativo como PWA
 *
 * Funcionamento:
 * 1. Escuta o evento "beforeinstallprompt" que o navegador dispara
 *    quando o site é instalável como PWA.
 * 2. Guarda o evento para poder chamar prompt() depois.
 * 3. Expõe a função `instalarApp()` que mostra o prompt de instalação.
 * 4. Expõe `instalavel` (true/false) para o botão aparecer ou sumir.
 */
import { useEffect, useState } from 'react';

// Tipo do evento beforeinstallprompt (não é padronizado nos tipos do DOM ainda)
interface EventoInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [instalavel, setInstalavel] = useState(false);
  const [instalando, setInstalando] = useState(false);
  const [eventoInstalacao, setEventoInstalacao] = useState<EventoInstalacao | null>(null);

  useEffect(() => {
    /** Captura o evento de instalação disparado pelo navegador */
    function tratarBeforeInstallPrompt(e: Event) {
      // Previne o prompt automático do navegador
      e.preventDefault();
      setEventoInstalacao(e as EventoInstalacao);
      setInstalavel(true);
    }

    /** Quando o app já foi instalado, remove o botão */
    function tratarAppInstalled() {
      setInstalavel(false);
      setEventoInstalacao(null);
    }

    window.addEventListener('beforeinstallprompt', tratarBeforeInstallPrompt);
    window.addEventListener('appinstalled', tratarAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', tratarBeforeInstallPrompt);
      window.removeEventListener('appinstalled', tratarAppInstalled);
    };
  }, []);

  /** Mostra o prompt de instalação do PWA */
  async function instalarApp() {
    if (!eventoInstalacao) return;
    setInstalando(true);
    eventoInstalacao.prompt();
    await eventoInstalacao.userChoice;
    setEventoInstalacao(null);
    setInstalavel(false);
    setInstalando(false);
  }

  return { instalavel, instalando, instalarApp };
}
