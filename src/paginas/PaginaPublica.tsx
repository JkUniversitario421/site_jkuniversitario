/**
 * Página PaginaPublica — site público principal do JK Universitário
 *
 * Estrutura (de cima para baixo):
 * 1. Cabecalho — barra fixa com logo, tema, notificações e instalação PWA
 * 2. BarraStories — barra horizontal de destaques (estilo Instagram)
 * 3. Hero — banner de apresentação da pousada
 * 4. BannerPatrocinador — espaço para parceiros (entre hero e acomodações)
 * 5. GridAcomodacoes — grid de cards com filtro por tipo
 * 6. BannerPatrocinador — segundo espaço de parceiros (após acomodações)
 * 7. SecaoInformacoes — mapa, regras de convivência e contato
 * 8. Rodape — rodapé com links e copyright
 *
 * Além disso, gerencia o estado do visualizador de stories (tela cheia).
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Story } from '@/lib/tipos';
import SEO from '@/components/SEO';
import Cabecalho from '@/components/Cabecalho';
import BarraStories from '@/components/BarraStories';
import VisualizadorStories from '@/components/VisualizadorStories';
import Hero from '@/components/Hero';
import GridAcomodacoes from '@/components/GridAcomodacoes';
import SecaoInformacoes from '@/components/SecaoInformacoes';
import Rodape from '@/components/Rodape';
import BannerPatrocinador from '@/components/BannerPatrocinador';

export default function PaginaPublica() {
  // ===== Estados dos stories =====
  const [stories, setStories] = useState<Story[]>([]);
  const [carregandoStories, setCarregandoStories] = useState(true);
  const [indiceStoryAberto, setIndiceStoryAberto] = useState<number | null>(null);

  /**
   * Carrega os stories ativos do banco ao montar o componente.
   * Filtra apenas os ativos e ordena pelos mais recentes.
   */
  useEffect(() => {
    async function carregarStories() {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao carregar stories:', error);
        setCarregandoStories(false);
        return;
      }
      setStories(data as Story[]);
      setCarregandoStories(false);
    }
    carregarStories();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* SEO: meta tags dinâmicas e Schema.org JSON-LD */}
      <SEO />

      {/* 1. Cabeçalho fixo com tema, notificações e PWA */}
      <Cabecalho />

      {/* 2. Barra de stories/destaques */}
      <BarraStories
        stories={stories}
        onAbrirStory={(indice) => setIndiceStoryAberto(indice)}
        carregando={carregandoStories}
      />

      {/* 3. Banner de apresentação */}
      <Hero />

      {/* 4. Espaço para parceiros universitários */}
      <BannerPatrocinador variante="horizontal" />

      {/* 5. Grid de acomodações com filtros */}
      <GridAcomodacoes />

      {/* 6. Segundo espaço de parceiros */}
      <BannerPatrocinador variante="horizontal" />

      {/* 7. Informações da pousada: mapa, regras, contato */}
      <SecaoInformacoes />

      {/* 8. Rodapé */}
      <Rodape />

      {/* ===== Visualizador de stories em tela cheia ===== */}
      {indiceStoryAberto !== null && stories.length > 0 && (
        <VisualizadorStories
          stories={stories}
          indiceInicial={indiceStoryAberto}
          onFechar={() => setIndiceStoryAberto(null)}
        />
      )}
    </div>
  );
}
