/**
 * Página PaginaDashboard — Painel Administrativo do JK Universitário
 *
 * Permite ao administrador:
 * 1. Alternar status das acomodações (Disponível / Ocupado / Manutenção)
 * 2. Publicar novos Stories / Destaques
 * 3. Gerenciar Stories existentes (ativar/desativar ou excluir)
 * 4. Fazer logout da sessão administrativa
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy, 
  query 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Acomodacao, Story } from '@/lib/tipos';
import { LogOut, Plus, Trash2, Eye, EyeOff, Building, Image, CheckCircle, Clock } from 'lucide-react';

export default function PaginaDashboard() {
  const navigate = useNavigate();

  // ===== Estados de Acomodações =====
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([]);
  const [carregandoAcomodacoes, setCarregandoAcomodacoes] = useState(true);

  // ===== Estados de Stories =====
  const [stories, setStories] = useState<Story[]>([]);
  const [carregandoStories, setCarregandoStories] = useState(true);

  // Form de novo Story
  const [tituloStory, setTituloStory] = useState('');
  const [imagemUrlStory, setImagemUrlStory] = useState('');
  const [descricaoStory, setDescricaoStory] = useState('');
  const [enviandoStory, setEnviandoStory] = useState(false);

  /**
   * Carrega acomodações e stories do Firebase ao carregar a página
   */
  useEffect(() => {
    carregarAcomodacoes();
    carregarStories();
  }, []);

  // 1. Carregar Acomodações do Firestore
  async function carregarAcomodacoes() {
    try {
      setCarregandoAcomodacoes(true);
      const colecao = collection(db, 'acomodacoes');
      const snapshot = await getDocs(colecao);
      const lista = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Acomodacao[];
      
      setAcomodacoes(lista);
    } catch (error) {
      console.error('Erro ao carregar acomodações:', error);
    } finally {
      setCarregandoAcomodacoes(false);
    }
  }

  // 2. Carregar Stories do Firestore
  async function carregarStories() {
    try {
      setCarregandoStories(true);
      const colecao = collection(db, 'stories');
      const q = query(colecao, orderBy('criado_em', 'desc'));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Story[];

      setStories(lista);
    } catch (error) {
      console.error('Erro ao carregar stories:', error);
    } finally {
      setCarregandoStories(false);
    }
  }

  // 3. Atualizar Status de uma Acomodação (ex: Disponível / Ocupado)
  async function alterarStatusAcomodacao(id: string, novoStatus: string) {
    try {
      const docRef = doc(db, 'acomodacoes', id);
      await updateDoc(docRef, { status: novoStatus });
      
      // Atualiza o estado local
      setAcomodacoes(prev =>
        prev.map(item => (item.id === id ? { ...item, status: novoStatus as any } : item))
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar o status da acomodação.');
    }
  }

  // 4. Criar um novo Story no Firestore
  async function handleCriarStory(e: React.FormEvent) {
    e.preventDefault();
    if (!tituloStory || !imagemUrlStory) {
      alert('Preencha o título e o link da imagem!');
      return;
    }

    try {
      setEnviandoStory(true);
      const colecao = collection(db, 'stories');
      await addDoc(colecao, {
        titulo: tituloStory,
        imagem_url: imagemUrlStory,
        descricao: descricaoStory,
        ativo: true,
        criado_em: serverTimestamp()
      });

      // Limpa formulário e recarrega
      setTituloStory('');
      setImagemUrlStory('');
      setDescricaoStory('');
      await carregarStories();
      alert('Story publicado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar story:', error);
      alert('Erro ao publicar o story.');
    } finally {
      setEnviandoStory(false);
    }
  }

  // 5. Alternar status Ativo/Inativo do Story
  async function alternarStatusStory(id: string, statusAtual: boolean) {
    try {
      const docRef = doc(db, 'stories', id);
      await updateDoc(docRef, { ativo: !statusAtual });
      
      setStories(prev =>
        prev.map(s => (s.id === id ? { ...s, ativo: !statusAtual } : s))
      );
    } catch (error) {
      console.error('Erro ao alternar story:', error);
    }
  }

  // 6. Excluir um Story
  async function deletarStory(id: string) {
    if (!confirm('Deseja realmente excluir este story?')) return;

    try {
      const docRef = doc(db, 'stories', id);
      await deleteDoc(docRef);
      setStories(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao deletar story:', error);
    }
  }

  // 7. Sair (Logout)
  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-6">
      {/* Barra Superior do Dashboard */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">JK Universitário — Gestão de Vagas e Destaques</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </header>

      <main className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seção 1: Gestão de Acomodações (2 colunas) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" /> Unidades e Vagas
            </h2>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-full">
              {acomodacoes.length} Unidades
            </span>
          </div>

          {carregandoAcomodacoes ? (
            <p className="text-sm text-gray-500">Carregando acomodações...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {acomodacoes.map(unit => (
                <div key={unit.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-base">{unit.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      unit.status === 'disponivel' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {unit.status === 'disponivel' ? 'Disponível' : 'Ocupado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{unit.descricao}</p>
                  
                  {/* Seletor de Status */}
                  <select
                    value={unit.status}
                    onChange={(e) => alterarStatusAcomodacao(unit.id, e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  >
                    <option value="disponivel">Marcar como Disponível</option>
                    <option value="ocupado">Marcar como Ocupado</option>
                    <option value="manutencao">Em Manutenção</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção 2: Stories / Destaques (1 coluna) */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Image className="w-5 h-5 text-indigo-500" /> Novo Story / Aviso
          </h2>

          {/* Form de Criação */}
          <form onSubmit={handleCriarStory} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Título do Story</label>
              <input
                type="text"
                placeholder="Ex: Quarto 2 disponível para o semestre!"
                value={tituloStory}
                onChange={e => setTituloStory(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Link da Imagem (URL)</label>
              <input
                type="text"
                placeholder="https://..."
                value={imagemUrlStory}
                onChange={e => setImagemUrlStory(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Descrição / Detalhes</label>
              <textarea
                rows={2}
                placeholder="Mais detalhes sobre o aviso..."
                value={descricaoStory}
                onChange={e => setDescricaoStory(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={enviandoStory}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium text-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> {enviandoStory ? 'Publicando...' : 'Publicar Story'}
            </button>
          </form>

          {/* Lista de Stories Publicados */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Stories Publicados</h3>
            {carregandoStories ? (
              <p className="text-xs text-gray-500">Carregando stories...</p>
            ) : (
              stories.map(story => (
                <div key={story.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={story.imagem_url} alt="" className="w-10 h-10 object-cover rounded-md" />
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate">{story.titulo}</p>
                      <p className="text-[10px] text-gray-400">{story.ativo ? 'Visível na Home' : 'Oculto'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => alternarStatusStory(story.id, story.ativo)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600"
                      title={story.ativo ? 'Ocultar' : 'Exibir'}
                    >
                      {story.ativo ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button
                      onClick={() => deletarStory(story.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}