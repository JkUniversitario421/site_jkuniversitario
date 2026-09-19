/**
 * Componente GridAcomodacoes — grid de acomodações com filtros
 *
 * Funcionamento:
 * - Carrega todas as acomodações do banco de dados (Firebase Firestore)
 * - Mostra botões de filtro por tipo (Todos, Quartos, JKs, Kitnets, Apartamentos, Áreas Comuns)
 * - Renderiza o grid de cards
 * - Quando um card é clicado, abre o Modal de Detalhes
 *
 * O filtro é puramente visual (client-side), não faz nova consulta ao banco.
 */
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Acomodacao, TipoAcomodacao } from '@/lib/tipos';
import CardAcomodacao from './CardAcomodacao';
import ModalAcomodacao from './ModalAcomodacao';

/** Filtros disponíveis com rótulo em português */
const FILTROS: { valor: TipoAcomodacao | 'todos'; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'quarto', rotulo: 'Quartos' },
  { valor: 'jk', rotulo: "JK's" },
  { valor: 'kitnet', rotulo: 'Kitnets' },
  { valor: 'apartamento', rotulo: 'Apartamentos' },
  { valor: 'area_comum', rotulo: 'Áreas Comuns' },
];

export default function GridAcomodacoes() {
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<TipoAcomodacao | 'todos'>('todos');
  const [acomodacaoSelecionada, setAcomodacaoSelecionada] = useState<Acomodacao | null>(null);

  /**
   * Carrega as acomodações do Firestore ao montar o componente.
   * Tenta ordenar pelo campo 'ordem' no banco ou faz ordenação em memória de fallback.
   */
  useEffect(() => {
    async function carregar() {
      try {
        const colecaoRef = collection(db, 'acomodacoes');
        let docsResult;

        try {
          const q = query(colecaoRef, orderBy('ordem', 'asc'));
          const snapshot = await getDocs(q);
          docsResult = snapshot.docs;
        } catch (indexError) {
          console.warn('Fallback: buscando acomodações sem ordenação de índice no Firestore.', indexError);
          const snapshot = await getDocs(colecaoRef);
          docsResult = snapshot.docs;
        }

        const lista = docsResult.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Acomodacao[];

        // Garantia de ordenação client-side caso a propriedade 'ordem' exista
        lista.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

        setAcomodacoes(lista);
      } catch (error) {
        console.error('Erro ao carregar acomodações:', error);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  /** Lista filtrada de acomodações (baseada no filtro selecionado) */
  const acomodacoesFiltradas =
    filtro === 'todos'
      ? acomodacoes
      : acomodacoes.filter((a) => a.tipo === filtro);

  return (
    <section id="acomodacoes" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===== Título ===== */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Nossas Acomodações
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
            16 unidades habitacionais e áreas comuns pensadas para o seu conforto e produtividade acadêmica.
          </p>
        </div>

        {/* ===== Botões de filtro ===== */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
                filtro === f.valor
                  ? 'bg-primaria-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>

        {/* ===== Grid de cards ===== */}
        {carregando ? (
          // Skeletons enquanto carrega
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-base overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-2/3 rounded skeleton" />
                  <div className="h-4 w-full rounded skeleton" />
                  <div className="h-4 w-1/2 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : acomodacoesFiltradas.length === 0 ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">
            Nenhuma acomodação encontrada nesta categoria.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {acomodacoesFiltradas.map((acomodacao) => (
              <CardAcomodacao
                key={acomodacao.id}
                acomodacao={acomodacao}
                onVerDetalhes={() => setAcomodacaoSelecionada(acomodacao)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== Modal de detalhes (abre ao clicar em um card) ===== */}
      {acomodacaoSelecionada && (
        <ModalAcomodacao
          acomodacao={acomodacaoSelecionada}
          onFechar={() => setAcomodacaoSelecionada(null)}
        />
      )}
    </section>
  );
}