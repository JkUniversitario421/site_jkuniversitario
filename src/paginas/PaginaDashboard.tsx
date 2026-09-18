/**
 * Página PaginaDashboard — painel principal do administrador
 *
 * Mostra:
 * - Cards de resumo (total de acomodações, disponíveis, ocupadas, stories ativos)
 * - Atalhos rápidos para gerenciar acomodações, stories e notificações
 * - Lista das últimas notificações enviadas
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, CheckCircle2, XCircle, Image, Bell, ArrowRight, TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';

/** Dados de resumo carregados do banco */
interface Resumo {
  totalAcomodacoes: number;
  disponiveis: number;
  ocupados: number;
  reservados: number;
  totalStories: number;
  storiesAtivos: number;
}

export default function PaginaDashboard() {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  /** Carrega os dados de resumo do banco */
  useEffect(() => {
    async function carregar() {
      const [{ data: acomods }, { data: stor }] = await Promise.all([
        supabase.from('acomodacoes').select('status'),
        supabase.from('stories').select('ativo'),
      ]);

      const totalAcomodacoes = acomods?.length ?? 0;
      const disponiveis = acomods?.filter((a) => a.status === 'disponivel').length ?? 0;
      const ocupados = acomods?.filter((a) => a.status === 'ocupado').length ?? 0;
      const reservados = acomods?.filter((a) => a.status === 'reservado').length ?? 0;

      setResumo({
        totalAcomodacoes,
        disponiveis,
        ocupados,
        reservados,
        totalStories: stor?.length ?? 0,
        storiesAtivos: stor?.filter((s) => s.ativo).length ?? 0,
      });
      setCarregando(false);
    }
    carregar();
  }, []);

  /** Cards de resumo */
  const cards = [
    { rotulo: 'Total de Acomodações', valor: resumo?.totalAcomodacoes ?? '—', icone: Building2, cor: 'text-primaria-600 bg-primaria-100 dark:bg-primaria-900/30 dark:text-primaria-400' },
    { rotulo: 'Disponíveis', valor: resumo?.disponiveis ?? '—', icone: CheckCircle2, cor: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
    { rotulo: 'Ocupados', valor: resumo?.ocupados ?? '—', icone: XCircle, cor: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
    { rotulo: 'Stories Ativos', valor: resumo?.storiesAtivos ?? '—', icone: Image, cor: 'text-secundaria-600 bg-secundaria-100 dark:bg-secundaria-900/30 dark:text-secundaria-400' },
  ];

  /** Atalhos rápidos */
  const atalhos = [
    { rotulo: 'Gerenciar Acomodações', desc: 'Editar fotos, valores e status', caminho: '/admin/acomodacoes', icone: Building2 },
    { rotulo: 'Publicar Stories', desc: 'Adicionar novos destaques', caminho: '/admin/stories', icone: Image },
    { rotulo: 'Enviar Notificação', desc: 'Disparar push para os usuários', caminho: '/admin/notificacoes', icone: Bell },
  ];

  return (
    <>
      <SEO titulo="Dashboard - Admin JK Universitário" />
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral da pousada</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((card, i) => {
            const Icone = card.icone;
            return (
              <div key={i} className="card-base p-5">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.cor}`}>
                  <Icone className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {carregando ? '...' : card.valor}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.rotulo}</p>
              </div>
            );
          })}
        </div>

        {/* Atalhos rápidos */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5" />
            Atalhos Rápidos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {atalhos.map((atalho, i) => {
              const Icone = atalho.icone;
              return (
                <Link
                  key={i}
                  to={atalho.caminho}
                  className="card-base group flex items-center gap-4 p-5 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primaria-100 text-primaria-600 dark:bg-primaria-900/30 dark:text-primaria-400">
                    <Icone className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{atalho.rotulo}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{atalho.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
