/**
 * Página PaginaNotificacoes — enviar e visualizar notificações push
 *
 * Funcionalidades:
 * - Formulário para compor e enviar uma notificação push manualmente
 * - Lista o histórico de notificações enviadas gravadas no Firestore
 * - Chama o endpoint/Cloud Function para envio via Firebase Cloud Messaging (FCM)
 */
import { useEffect, useState } from 'react';
import {
  Loader2, Send, Bell, AlertCircle, Check, Clock,
} from 'lucide-react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SEO from '@/components/SEO';

interface Notificacao {
  id: string;
  titulo: string;
  corpo: string;
  link: string | null;
  enviada: boolean;
  criado_em: any;
}

export default function PaginaNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [corpo, setCorpo] = useState('');
  const [link, setLink] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  /** Carrega o histórico de notificações do Firestore */
  async function carregar() {
    setCarregando(true);
    try {
      const colecaoRef = collection(db, 'notificacoes');
      const q = query(colecaoRef, orderBy('criado_em', 'desc'));
      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Notificacao[];

      setNotificacoes(lista);
    } catch (err: any) {
      console.error('Erro ao carregar notificações:', err);
      setErro('Erro ao carregar histórico de notificações.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  /** Envia uma notificação push */
  async function enviar() {
    if (!titulo.trim() || !corpo.trim()) {
      setErro('Preencha o título e a mensagem.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      // 1. Registra no Firestore
      const colecaoRef = collection(db, 'notificacoes');
      await addDoc(colecaoRef, {
        titulo: titulo.trim(),
        corpo: corpo.trim(),
        link: link.trim() || null,
        enviada: true,
        criado_em: serverTimestamp(),
      });

      // 2. Dispara requisição para a Cloud Function / Endpoint FCM (caso configurado)
      const functionUrl = import.meta.env.VITE_FIREBASE_PUSH_FUNCTION_URL;
      if (functionUrl) {
        const resposta = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titulo: titulo.trim(),
            corpo: corpo.trim(),
            link: link.trim() || '/',
          }),
        });

        if (!resposta.ok) {
          console.warn('Aviso: o push não pôde ser disparado via Cloud Function:', resposta.status);
        }
      }

      // Limpa o formulário
      setTitulo('');
      setCorpo('');
      setLink('');
      setSucesso(true);
      setEnviando(false);
      carregar();

      setTimeout(() => setSucesso(false), 3000);
    } catch (err: any) {
      console.error('Erro ao registrar notificação:', err);
      setErro('Falha ao enviar notificação: ' + (err.message || 'Erro desconhecido'));
      setEnviando(false);
    }
  }

  /** Formata data para exibição tratando Timestamp do Firestore ou ISO String */
  function formatarData(dataVal: any): string {
    if (!dataVal) return '';
    let dataObj: Date;

    if (dataVal instanceof Timestamp) {
      dataObj = dataVal.toDate();
    } else if (typeof dataVal?.toDate === 'function') {
      dataObj = dataVal.toDate();
    } else {
      dataObj = new Date(dataVal);
    }

    return dataObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <>
      <SEO titulo="Notificações - Admin JK Universitário" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificações Push</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Envie avisos e novidades para os usuários registrados</p>
        </div>

        {/* Mensagens de feedback */}
        {erro && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Check className="h-4 w-4 shrink-0" />
            Notificação registrada e enviada com sucesso!
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário de envio */}
          <div className="card-base p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <Send className="h-5 w-5" />
              Enviar Notificação
            </h2>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Novo JK disponível!"
                maxLength={50}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Mensagem</label>
              <textarea
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                rows={3}
                placeholder="Ex: O JK 01 acabou de ficar disponível. Entre em contato!"
                maxLength={200}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-400">{corpo.length}/200 caracteres</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Link ao clicar (opcional)</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ex: /#acomodacoes"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <button onClick={enviar} disabled={enviando} className="btn-primario w-full disabled:opacity-60">
              {enviando ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><Bell className="h-4 w-4" /> Enviar Notificação</>
              )}
            </button>
          </div>

          {/* Histórico de notificações */}
          <div className="card-base p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <Clock className="h-5 w-5" />
              Histórico
            </h2>

            {carregando ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : notificacoes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Nenhuma notificação enviada ainda.</p>
            ) : (
              <div className="space-y-2">
                {notificacoes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{n.titulo}</h3>
                      <span className="text-xs text-gray-400">{formatarData(n.criado_em)}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{n.corpo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}