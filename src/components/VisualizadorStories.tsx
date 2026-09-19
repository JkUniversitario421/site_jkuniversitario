/**
 * Componente VisualizadorStories — visualizador em tela cheia (estilo Instagram)
 *
 * Funcionamento:
 * - Abre em overlay fullscreen sobre toda a página
 * - Mostra um story por vez com barra de progresso no topo
 * - Avança automaticamente após 5 segundos ou ao clicar/tocar
 * - Setas para navegar manualmente (esquerda/direita)
 * - Botão X para fechar
 * - Suporta navegação por teclado (ESC fecha, setas navegam)
 *
 * Props:
 * - stories: lista completa de stories
 * - indiceInicial: qual story abrir primeiro
 * - onFechar: função chamada ao fechar o visualizador
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Story } from '@/lib/tipos';

interface Props {
  stories: Story[];
  indiceInicial: number;
  onFechar: () => void;
}

/** Duração de cada story em milissegundos */
const DURACAO_STORY = 5000;

export default function VisualizadorStories({ stories, indiceInicial, onFechar }: Props) {
  const [indiceAtual, setIndiceAtual] = useState(indiceInicial);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const tempoInicioRef = useRef<number>(Date.now());
  const tempoPausadoRef = useRef<number>(0);

  /** Avança para o próximo story ou fecha se for o último */
  const avancar = useCallback(() => {
    if (indiceAtual < stories.length - 1) {
      setIndiceAtual((i) => i + 1);
      setProgresso(0);
      tempoInicioRef.current = Date.now();
      tempoPausadoRef.current = 0;
    } else {
      onFechar();
    }
  }, [indiceAtual, stories.length, onFechar]);

  /** Volta para o story anterior */
  const voltar = useCallback(() => {
    if (indiceAtual > 0) {
      setIndiceAtual((i) => i - 1);
      setProgresso(0);
      tempoInicioRef.current = Date.now();
      tempoPausadoRef.current = 0;
    }
  }, [indiceAtual]);

  /** Avança automaticamente baseado no tempo decorrido */
  useEffect(() => {
    if (pausado) return;

    const intervalo = setInterval(() => {
      const decorrido = Date.now() - tempoInicioRef.current - tempoPausadoRef.current;
      const pct = Math.min((decorrido / DURACAO_STORY) * 100, 100);
      setProgresso(pct);
      if (pct >= 100) {
        avancadoAutomatico();
      }
    }, 50);

    function avancadoAutomatico() {
      avancadoAutomaticoHelper();
    }

    function avancadoAutomaticoHelper() {
      avancar();
    }

    return () => clearInterval(intervalo);
  }, [indiceAtual, pausado, avancar]);

  /** Navegação por teclado: ESC fecha, setas navegam */
  useEffect(() => {
    function tratarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowRight') avancar();
      if (e.key === 'ArrowLeft') voltar();
      if (e.key === ' ') {
        e.preventDefault();
        setPausado((p) => !p);
      }
    }
    window.addEventListener('keydown', tratarTecla);
    // Previne scroll do body enquanto o visualizador está aberto
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', tratarTecla);
      document.body.style.overflow = '';
    };
  }, [avancar, voltar, onFechar]);

  /** Pausa/retoma o cronômetro */
  function alternarPausa() {
    if (!pausado) {
      // Ao pausar, registra quanto tempo já passou
      tempoPausadoRef.current = Date.now() - tempoInicioRef.current - tempoPausadoRef.current;
    } else {
      // Ao retomar, ajusta o tempo de início para descontar o tempo pausado
      tempoInicioRef.current = Date.now() - tempoPausadoRef.current;
      tempoPausadoRef.current = 0;
    }
    setPausado((p) => !p);
  }

  if (stories.length === 0) return null;
  const story = stories[indiceAtual];
  // Garante a obtenção do endereço de imagem tanto por `imagem` quanto por `imagem_url`
  const srcImagem = story.imagem || story.imagem_url;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-fade-in">
      {/* ===== Barra de progresso no topo (uma barra por story) ===== */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3">
        {stories.map((_, i) => (
          <div
            key={i}
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
          >
            <div
              className="h-full bg-white transition-all"
              style={{
                width: i < indiceAtual ? '100%' : i === indiceAtual ? `${progresso}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* ===== Botão fechar ===== */}
      <button
        onClick={onFechar}
        className="absolute right-4 top-8 z-20 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
        aria-label="Fechar stories"
      >
        <X className="h-5 w-5" />
      </button>

      {/* ===== Botão pausar/retomar ===== */}
      <button
        onClick={alternarPausa}
        className="absolute left-4 top-8 z-20 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
        aria-label={pausado ? 'Retomar' : 'Pausar'}
      >
        {pausado ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
      </button>

      {/* ===== Botão voltar (esquerda) ===== */}
      {indiceAtual > 0 && (
        <button
          onClick={voltar}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 sm:left-4"
          aria-label="Story anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* ===== Botão avançar (direita) ===== */}
      {indiceAtual < stories.length - 1 && (
        <button
          onClick={avancar}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 sm:right-4"
          aria-label="Próximo story"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* ===== Área de toque para navegar (esquerda = voltar, direita = avançar) ===== */}
      <div className="absolute inset-0 flex">
        <button
          onClick={voltar}
          className="h-full w-1/3"
          aria-label="Toque para voltar"
          tabIndex={-1}
        />
        <button
          onClick={avancar}
          className="h-full w-2/3"
          aria-label="Toque para avançar"
          tabIndex={-1}
        />
      </div>

      {/* ===== Imagem e conteúdo do story ===== */}
      <div className="relative h-full w-full max-w-md animate-scale-in">
        <img
          src={srcImagem}
          alt={story.titulo}
          className="h-full w-full object-cover"
        />
        {/* Gradiente escuro na parte inferior para legibilidade do texto */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
          <h3 className="text-lg font-bold text-white">{story.titulo}</h3>
          {story.descricao && (
            <p className="mt-1 text-sm text-white/90">{story.descricao}</p>
          )}
        </div>
      </div>
    </div>
  );
}