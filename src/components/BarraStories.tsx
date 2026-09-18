/**
 * Componente BarraStories — barra horizontal de stories/destaques
 *
 * Aparece no topo da página principal, estilo Instagram/Facebook.
 * Mostra círculos com imagem representando cada story.
 * Ao clicar em um círculo, abre o visualizador de stories em tela cheia.
 *
 * Props:
 * - stories: lista de stories vindas do banco
 * - onAbrirStory: função chamada ao clicar, recebe o índice inicial
 * - carregando: se true, mostra skeletons enquanto carrega
 */
import { Story } from '@/lib/tipos';

interface Props {
  stories: Story[];
  onAbrirStory: (indice: number) => void;
  carregando: boolean;
}

export default function BarraStories({ stories, onAbrirStory, carregando }: Props) {
  return (
    <section className="border-b border-gray-200/60 bg-white py-4 dark:border-gray-800/60 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* Estado de carregamento: mostra 5 skeletons */}
          {carregando &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="h-16 w-16 rounded-full skeleton sm:h-20 sm:w-20" />
                <div className="h-3 w-12 rounded skeleton" />
              </div>
            ))}

          {/* Lista de stories reais */}
          {!carregando &&
            stories.map((story, indice) => (
              <button
                key={story.id}
                onClick={() => onAbrirStory(indice)}
                className="group flex flex-col items-center gap-1.5 shrink-0"
                aria-label={`Ver destaque: ${story.titulo}`}
              >
                {/* Círculo com borda gradiente (estilo Instagram) */}
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-primaria-500 via-secundaria-400 to-primaria-400 p-[2.5px] transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
                  <div className="h-full w-full rounded-full bg-white p-[2px] dark:bg-gray-950">
                    <img
                      src={story.imagem}
                      alt={story.titulo}
                      className="h-full w-full rounded-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                {/* Título truncado abaixo do círculo */}
                <span className="max-w-[68px] truncate text-xs font-medium text-gray-600 dark:text-gray-400 sm:max-w-[80px]">
                  {story.titulo}
                </span>
              </button>
            ))}

          {/* Se não há stories nem carregamento */}
          {!carregando && stories.length === 0 && (
            <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
              Nenhum destaque disponível no momento.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
