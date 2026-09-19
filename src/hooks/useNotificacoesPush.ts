/**
 * Hook useNotificacoesPush — gerencia inscrição e permissão de notificações push via Firebase Messaging (FCM)
 *
 * Funcionamento:
 * 1. Pede permissão do usuário para enviar notificações.
 * 2. Obtém o token FCM do dispositivo.
 * 3. Salva o token no Firestore na coleção 'inscricoes_push' para envios futuros.
 * 4. Expõe o estado da permissão e a função de inscrever.
 */
import { useState, useCallback } from 'react';
import { getToken } from 'firebase/messaging';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { messaging, db } from '@/lib/firebase';

// Estado da permissão de notificações
type EstadoPermissao = 'default' | 'granted' | 'denied' | 'unsupported';

export function useNotificacoesPush() {
  const [permissao, setPermissao] = useState<EstadoPermissao>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [inscrito, setInscrito] = useState(false);
  const [carregando, setCarregando] = useState(false);

  /**
   * Pede permissão e solicita o Token FCM do dispositivo.
   * Após obter o token, salva na coleção 'inscricoes_push' no Firestore.
   */
  const inscrever = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
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

      // Check se o Firebase Messaging foi inicializado (requer suporte do navegador)
      if (!messaging) {
        setCarregando(false);
        return { erro: 'Firebase Messaging não está disponível neste ambiente.' };
      }

      // 2. Obtém o token FCM usando a VAPID Key das variáveis de ambiente
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const registration = await navigator.serviceWorker.ready;

      const tokenAtual = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!tokenAtual) {
        setCarregando(false);
        return { erro: 'Não foi possível gerar o token de notificação.' };
      }

      // 3. Salva o token no Firestore
      const docRef = doc(collection(db, 'inscricoes_push'), tokenAtual);
      await setDoc(docRef, {
        token: tokenAtual,
        criadoEm: serverTimestamp(),
        userAgent: navigator.userAgent,
      }, { merge: true });

      setInscrito(true);
      setCarregando(false);
      return { erro: null };
    } catch (err: any) {
      console.error('Erro ao inscrever notificações push:', err);
      setCarregando(false);
      return { erro: err.message || 'Falha ao inscrever para notificações.' };
    }
  }, []);

  return { permissao, inscrito, carregando, inscrever };
}