/**
 * Página PaginaPublicadorStories — gerenciar e publicar stories/destaques
 *
 * Funcionalidades:
 * - Lista os stories existentes com opção de ativar/desativar e remover
 * - Formulário para criar um novo story: upload de imagem, título, descrição, link
 * - Upload de imagem para o bucket de Storage
 * - Ao publicar um novo story, dispara uma notificação push (opcional)
 */
import { useEffect, useState } from 'react';
import {
  Loader2, Plus, Trash2, Upload, X, Check, AlertCircle, Eye, EyeOff, Bell, Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Story } from '@/lib/tipos';
import SEO from '@/components/SEO';

export default function PaginaPublicadorStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Estados do formulário de novo story
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [link, setLink] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [enviarNotificacao, setEnviarNotificacao] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [subindoImagem, setSubindoImagem] = useState(false);

  /** Carrega os stories do banco (todos, incluindo inativos) */
  async function carregar() {
    setCarregando(true);
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      setErro('Erro ao carregar stories.');
      setCarregando(false);
      return;
    }
    setStories(data as Story[]);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  /** Faz upload da imagem do story para o Storage */
  async function subirImagem(arquivo: File): Promise<string | null> {
    const ext = arquivo.name.split('.').pop();
    const nomeArquivo = `stories/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('fotos-jk')
      .upload(nomeArquivo, arquivo);

    if (error) {
      setErro('Erro ao subir imagem: ' + error.message);
      return null;
    }

    const { data } = supabase.storage
      .from('fotos-jk')
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;
  }

  /** Processa o upload de imagem do formulário */
  async function tratarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setSubindoImagem(true);
    const url = await subirImagem(arquivo);
    if (url) setImagemUrl(url);
    setSubindoImagem(false);
    e.target.value = '';
  }

  /** Publica um novo story no banco */
  async function publicarStory() {
    if (!titulo.trim() || !imagemUrl) {
      setErro('Preencha o título e selecione uma imagem.');
      return;
    }

    setSalvando(true);
    setErro(null);

    const { error } = await supabase.from('stories').insert({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      imagem: imagemUrl,
      link: link.trim() || null,
      ativo: true,
    });

    if (error) {
      setErro('Erro ao publicar story: ' + error.message);
      setSalvando(false);
      return;
    }

    // Se marcado, dispara notificação push para os usuários
    if (enviarNotificacao) {
      await dispararNotificacaoPush(titulo.trim(), descricao.trim() || 'Novo destaque disponível no app!');
    }

    // Limpa o formulário
    setTitulo('');
    setDescricao('');
    setLink('');
    setImagemUrl('');
    setEnviarNotificacao(true);
    setMostrarForm(false);
    setSucesso(true);
    setSalvando(false);
    carregar();

    setTimeout(() => setSucesso(false), 3000);
  }

  /** Alterna o status ativo/inativo de um story */
  async function alternarAtivo(story: Story) {
    const { error } = await supabase
      .from('stories')
      .update({ ativo: !story.ativo })
      .eq('id', story.id);

    if (error) {
      setErro('Erro ao atualizar story.');
      return;
    }
    carregar();
  }

  /** Remove um story do banco */
  async function removerStory(story: Story) {
    if (!confirm(`Remover o story "${story.titulo}"?`)) return;

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', story.id);

    if (error) {
      setErro('Erro ao remover story.');
      return;
    }
    carregar();
  }

  /**
   * Dispara uma notificação push para todos os dispositivos inscritos.
   * Chama a Edge Function que processa o envio via Web Push.
   */
  async function dispararNotificacaoPush(tituloNotif: string, corpoNotif: string) {
    try {
      // Registra a notificação no banco
      await supabase.from('notificacoes').insert({
        titulo: tituloNotif,
        corpo: corpoNotif,
        enviada: false,
      });

      // Chama a Edge Function para enviar o push
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enviar-push`;
      const resposta = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ titulo: tituloNotif, corpo: corpoNotif }),
      });

      if (!resposta.ok) {
        console.warn('Aviso: notificação push não pôde ser enviada.', resposta.status);
      }
    } catch (err) {
      // Não bloqueia a publicação se a notificação falhar
      console.warn('Aviso: erro ao disparar push:', err);
    }
  }

  /** Limpa o formulário e fecha */
  function fecharForm() {
    setMostrarForm(false);
    setTitulo('');
    setDescricao('');
    setLink('');
    setImagemUrl('');
    setErro(null);
  }

  return (
    <>
      <SEO titulo="Stories - Admin JK Universitário" />
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stories / Destaques</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Publique e gerencie os destaques da barra superior</p>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="btn-primario"
          >
            <Plus className="h-4 w-4" />
            Novo Story
          </button>
        </div>

        {/* Mensagens */}
        {erro && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Check className="h-4 w-4 shrink-0" />
            Story publicado com sucesso!
          </div>
        )}

        {/* Formulário de novo story */}
        {mostrarForm && (
          <div className="card-base p-5 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">Novo Story</h2>
              <button onClick={fecharForm} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Upload de imagem */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Imagem do Story</label>
              {imagemUrl ? (
                <div className="relative inline-block">
                  <img src={imagemUrl} alt="Preview" className="h-40 w-40 rounded-xl object-cover" />
                  <button
                    onClick={() => setImagemUrl('')}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-primaria-500 hover:text-primaria-500 dark:border-gray-700">
                  {subindoImagem ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="mt-2 text-xs">Subir imagem</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={tratarUpload} disabled={subindoImagem} />
                </label>
              )}
            </div>

            {/* Título */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Novo JK Disponível"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição / Legenda</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={2}
                placeholder="Breve descrição do destaque"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Link opcional */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Link (opcional)</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ex: #acomodacoes"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Checkbox de notificação */}
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={enviarNotificacao}
                onChange={(e) => setEnviarNotificacao(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primaria-600 focus:ring-primaria-500"
              />
              <Bell className="h-4 w-4" />
              Enviar notificação push para os usuários
            </label>

            {/* Botão publicar */}
            <div className="flex justify-end gap-3">
              <button onClick={fecharForm} className="btn-secundario">Cancelar</button>
              <button onClick={publicarStory} disabled={salvando} className="btn-primario disabled:opacity-60">
                {salvando ? <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</> : <>Publicar Story</>}
              </button>
            </div>
          </div>
        )}

        {/* Lista de stories existentes */}
        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : stories.length === 0 ? (
          <div className="card-base flex flex-col items-center gap-3 py-12 text-center">
            <ImageIcon className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum story publicado ainda.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <div key={story.id} className="card-base overflow-hidden">
                <div className="relative h-32">
                  <img src={story.imagem} alt={story.titulo} className="h-full w-full object-cover" />
                  <div className="absolute right-2 top-2">
                    {story.ativo ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                        <Eye className="h-3 w-3" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                        <EyeOff className="h-3 w-3" /> Oculto
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{story.titulo}</h3>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{story.descricao}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => alternarAtivo(story)}
                      className="flex-1 rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {story.ativo ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button
                      onClick={() => removerStory(story)}
                      className="rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
