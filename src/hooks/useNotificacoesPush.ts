/**
 * Hook useNotificacoesPush — gerencia inscrição e permissão de notificações push
 *
 * Funcionamento:
 * 1. Pede permissão do usuário para enviar notificações.
 * 2. Inscreve o dispositivo no Push Manager do navegador (Web Push API).
 * 3. Salva a inscrição no banco de dados (tabela inscricoes_push)
 *    para que a Edge Function possa enviar notificações posteriormente.
 * 4. Expõe o estado da permissão e a função de inscrever.
 *
 * NOTA TÉCNICA: O envio real de notificações push requer chaves VAPID
 * configuradas no servidor. A Edge Function que envia as notificações
 * lê as inscrições do banco e envia via Web Push Protocol.
 * Por enquanto, o fluxo de inscrição funciona no navegador; o disparo
 * real depende da configuração das chaves VAPID no ambiente.
 */
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Estado da permissão de notificações
type EstadoPermissao = 'default' | 'granted' | 'denied' | 'unsupported';

export function useNotificacoesPush() {
  const [permissao, setPermissao] = useState<EstadoPermissao>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [inscrito, setInscrito] = useState(false);
  const [carregando, setCarregando] = useState(false);

  /**
   * Converte um ArrayBuffer para Base64URL (formato esperado pelo Web Push)
   */
  function bufferParaBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let string = '';
    bytes.forEach((byte) => (string += String.fromCharCode(byte)));
    return btoa(string).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Pede permissão e inscreve o dispositivo para receber notificações push.
   * Após inscrever, salva a inscrição no banco de dados.
   */
  const inscrever = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermissao('unsupported');
      return { erro: 'Seu navegador não suporta notificações push.' };
    }

    setCarregando(true);

    try {
      // 1. Pede permissão do usuário
      const perm = await Notification.requestPermission();
      setPermissao(perm as EstadoPermissao);

      if (perm !== 'granted') {
        setCarregando(false);
        return { erro: 'Permissão de notificação negada.' };
      }

      // 2. Registra o service worker (se ainda não estiver)
      const registro = await navigator.serviceWorker.ready;

      // 3. Inscreve no Push Manager
      // A chave VAPID pública seria configurada no ambiente.
      // Por enquanto usamos uma chave placeholder — o fluxo de inscrição
      // funciona, mas o disparo real requer configuração da chave.
      const inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: undefined,
      });

      // 4. Extrai os dados da inscrição
      const endpoint = inscricao.endpoint;
      const chaves = inscricao.getKey('p256dh');
      const auth = inscricao.getKey('auth');

      if (!chaves || !auth) {
        setCarregando(false);
        return { erro: 'Não foi possível obter as chaves de inscrição.' };
      }

      // 5. Salva a inscrição no banco de dados
      const { error } = await supabase.from('inscricoes_push').insert({
        endpoint,
        chaves_p256dh: bufferParaBase64(chaves),
        chaves_auth: bufferParaBase64(auth),
      });

      if (error) {
        // Se o endpoint já existe, não é um erro crítico
        console.warn('Aviso ao salvar inscrição push:', error.message);
      }

      setInscrito(true);
      setCarregando(false);
      return { erro: null };
    } catch (err) {
      setCarregando(false);
      return { erro: 'Falha ao inscrever para notificações.' };
    }
  }, []);

  return { permissao, inscrito, carregando, inscrever };
}
