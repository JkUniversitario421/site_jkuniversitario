/**
 * Página PaginaGerenciarAcomodacoes — CRUD de acomodações
 *
 * Funcionalidades:
 * - Lista todas as acomodações em uma tabela/grid
 * - Permite editar nome, descrição, valor, status, comodidades e fotos
 * - Upload de fotos para o bucket de Storage do Supabase
 * - Alterações salvas em tempo real no banco de dados
 *
 * Cada acomodação abre em um modal de edição ao clicar em "Editar".
 */
import { useEffect, useState } from 'react';
import {
  Loader2, Pencil, Save, X, Upload, Plus, Trash2, Check, AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Acomodacao, TipoAcomodacao, StatusAcomodacao,
} from '@/lib/tipos';
import SEO from '@/components/SEO';

/** Rótulos para os tipos de acomodação */
const ROTULOS_TIPO: Record<TipoAcomodacao, string> = {
  quarto: 'Quarto',
  jk: 'JK',
  kitnet: 'Kitnet',
  apartamento: 'Apartamento',
  area_comum: 'Área Comum',
};

/** Rótulos e cores para os status */
const ROTULOS_STATUS: { valor: StatusAcomodacao; rotulo: string; classe: string }[] = [
  { valor: 'disponivel', rotulo: 'Disponível', classe: 'tag-disponivel' },
  { valor: 'ocupado', rotulo: 'Ocupado', classe: 'tag-ocupado' },
  { valor: 'reservado', rotulo: 'Reservado', classe: 'tag-reservado' },
];

export default function PaginaGerenciarAcomodacoes() {
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<Acomodacao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  /** Carrega todas as acomodações do banco */
  async function carregar() {
    setCarregando(true);
    const { data, error } = await supabase
      .from('acomodacoes')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      setErro('Erro ao carregar acomodações.');
      setCarregando(false);
      return;
    }
    setAcomodacoes(data as Acomodacao[]);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  /** Salva as alterações de uma acomodação no banco */
  async function salvar(acomodacao: Acomodacao) {
    setSalvando(true);
    setErro(null);

    const { error } = await supabase
      .from('acomodacoes')
      .update({
        nome: acomodacao.nome,
        descricao: acomodacao.descricao,
        valor: acomodacao.valor,
        status: acomodacao.status,
        fotos: acomodacao.fotos,
        comodidades: acomodacao.comodidades,
      })
      .eq('id', acomodacao.id);

    if (error) {
      setErro('Erro ao salvar: ' + error.message);
      setSalvando(false);
      return;
    }

    setSucesso(true);
    setSalvando(false);
    setEditando(null);
    carregar();

    // Limpa a mensagem de sucesso após 3 segundos
    setTimeout(() => setSucesso(false), 3000);
  }

  /** Faz upload de uma foto para o bucket de Storage */
  async function subirFoto(arquivo: File, acomodacaoId: string): Promise<string | null> {
    const ext = arquivo.name.split('.').pop();
    const nomeArquivo = `${acomodacaoId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('fotos-jk')
      .upload(nomeArquivo, arquivo);

    if (error) {
      setErro('Erro ao subir foto: ' + error.message);
      return null;
    }

    // Retorna a URL pública da foto
    const { data } = supabase.storage
      .from('fotos-jk')
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;
  }

  return (
    <>
      <SEO titulo="Gerenciar Acomodações - Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Acomodações</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Edite fotos, descrições, valores e status das unidades</p>
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
            Alterações salvas com sucesso!
          </div>
        )}

        {/* Lista de acomodações */}
        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-3">
            {acomodacoes.map((acomod) => {
              const infoStatus = ROTULOS_STATUS.find((s) => s.valor === acomod.status);
              return (
                <div key={acomod.id} className="card-base flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <img
                    src={acomod.fotos[0] ?? 'https://images.pexels.com/photos/8142976/pexels-photo-8142976.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'}
                    alt={acomod.nome}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{acomod.nome}</h3>
                      <span className="text-xs text-gray-400">({ROTULOS_TIPO[acomod.tipo]})</span>
                    </div>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">{acomod.descricao}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {infoStatus && <span className={infoStatus.classe}>{infoStatus.rotulo}</span>}
                      {acomod.valor !== null && (
                        <span className="text-xs text-gray-400">R$ {acomod.valor.toFixed(0).replace('.', ',')}/mês</span>
                      )}
                    </div>
                  </div>

                  {/* Botão editar */}
                  <button
                    onClick={() => setEditando(acomod)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ====== Modal de edição ====== */}
      {editando && (
        <ModalEdicao
          acomodacao={editando}
          onFechar={() => setEditando(null)}
          onSalvar={salvar}
          onSubirFoto={subirFoto}
          salvando={salvando}
        />
      )}
    </>
  );
}

// ====== Modal de edição de acomodação ======
function ModalEdicao({
  acomodacao,
  onFechar,
  onSalvar,
  onSubirFoto,
  salvando,
}: {
  acomodacao: Acomodacao;
  onFechar: () => void;
  onSalvar: (a: Acomodacao) => void;
  onSubirFoto: (arquivo: File, id: string) => Promise<string | null>;
  salvando: boolean;
}) {
  const [form, setForm] = useState<Acomodacao>({ ...acomodacao });
  const [novaComodidade, setNovaComodidade] = useState('');
  const [subindoFoto, setSubindoFoto] = useState(false);

  /** Atualiza um campo do formulário */
  function atualizar<K extends keyof Acomodacao>(campo: K, valor: Acomodacao[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  /** Adiciona uma comodidade à lista */
  function adicionarComodidade() {
    if (!novaComodidade.trim()) return;
    atualizar('comodidades', [...form.comodidades, novaComodidade.trim()]);
    setNovaComodidade('');
  }

  /** Remove uma comodidade da lista */
  function removerComodidade(indice: number) {
    atualizar('comodidades', form.comodidades.filter((_, i) => i !== indice));
  }

  /** Remove uma foto da lista */
  function removerFoto(indice: number) {
    atualizar('fotos', form.fotos.filter((_, i) => i !== indice));
  }

  /** Processa o upload de uma nova foto */
  async function tratarUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setSubindoFoto(true);
    const url = await onSubirFoto(arquivo, form.id);
    if (url) {
      atualizar('fotos', [...form.fotos, url]);
    }
    setSubindoFoto(false);
    // Limpa o input para permitir reupload do mesmo arquivo
    e.target.value = '';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={onFechar}>
      <div
        className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 animate-scale-in dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar {acomodacao.nome}</h2>
          <button onClick={onFechar} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => atualizar('nome', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => atualizar('descricao', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Valor e Status lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Valor (R$/mês)</label>
              <input
                type="number"
                value={form.valor ?? ''}
                onChange={(e) => atualizar('valor', e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder="Deixe vazio para áreas comuns"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => atualizar('status', e.target.value as StatusAcomodacao)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {ROTULOS_STATUS.map((s) => (
                  <option key={s.valor} value={s.valor}>{s.rotulo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fotos */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Fotos</label>
            <div className="flex flex-wrap gap-2">
              {form.fotos.map((foto, i) => (
                <div key={i} className="relative group">
                  <img src={foto} alt={`Foto ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                  <button
                    onClick={() => removerFoto(i)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {/* Botão de upload */}
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-primaria-500 hover:text-primaria-500 dark:border-gray-700">
                {subindoFoto ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="mt-1 text-xs">Subir</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={tratarUploadFoto} disabled={subindoFoto} />
              </label>
            </div>
          </div>

          {/* Comodidades */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Comodidades</label>
            <div className="flex flex-wrap gap-2">
              {form.comodidades.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {c}
                  <button onClick={() => removerComodidade(i)} className="text-gray-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={novaComodidade}
                onChange={(e) => setNovaComodidade(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarComodidade())}
                placeholder="Ex: Ar-condicionado"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button onClick={adicionarComodidade} className="btn-secundario px-3 py-2">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onFechar} className="btn-secundario">Cancelar</button>
          <button onClick={() => onSalvar(form)} disabled={salvando} className="btn-primario disabled:opacity-60">
            {salvando ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4" /> Salvar Alterações</>}
          </button>
        </div>
      </div>
    </div>
  );
}
