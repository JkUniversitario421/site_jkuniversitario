/**
 * Componente ModalAcomodacao — modal de detalhes da acomodação
 *
 * Abre em overlay sobre a página e mostra:
 * - Galeria de fotos com carrossel (navegação por setas e indicadores)
 * - Tipo, nome, descrição detalhada
 * - Lista de comodidades com ícones
 * - Valor mensal
 * - Botão de WhatsApp com mensagem pré-formatada
 * - Botão para agendar visita
 *
 * Props:
 * - acomodacao: dados completos da acomodação
 * - onFechar: função para fechar o modal
 */
import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, MessageCircle, Calendar, MapPin, BedDouble, Home, Building2, CookingPot } from 'lucide-react';
import { Acomodacao, TipoAcomodacao, linkWhatsApp, INFO_POUSADA } from '@/lib/tipos';

interface Props {
  acomodacao: Acomodacao;
  onFechar: () => void;
}

/** Rótulos e ícones por tipo de acomodação */
const ROTULO_TIPO: Record<TipoAcomodacao, { icone: typeof BedDouble; rotulo: string }> = {
  quarto: { icone: BedDouble, rotulo: 'Quarto (Suíte + Cozinha Compartilhada)' },
  jk: { icone: Home, rotulo: 'JK (Banheiro + Cozinha + Sacada)' },
  kitnet: { icone: Building2, rotulo: 'Kitnet Independente' },
  apartamento: { icone: Building2, rotulo: 'Apartamento Semi-Mobilado' },
  area_comum: { icone: CookingPot, rotulo: 'Área de Uso Comum' },
};

export default function ModalAcomodacao({ acomodacao, onFechar }: Props) {
  const [fotoAtual, setFotoAtual] = useState(0);
  const fotos = acomodacao.fotos;
  const infoTipo = ROTULO_TIPO[acomodacao.tipo];
  const IconeTipo = infoTipo.icone;

  /** Vai para a foto anterior no carrossel (circular) */
  function fotoAnterior() {
    setFotoAtual((i) => (i === 0 ? fotos.length - 1 : i - 1));
  }

  /** Vai para a próxima foto no carrossel (circular) */
  function proximaFoto() {
    setFotoAtual((i) => (i === fotos.length - 1 ? 0 : i + 1));
  }

  /** Navegação por teclado: ESC fecha, setas navegam fotos */
  useEffect(() => {
    function tratarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
      if (e.key === 'ArrowLeft') fotoAnterior();
      if (e.key === 'ArrowRight') proximaFoto();
    }
    window.addEventListener('keydown', tratarTecla);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', tratarTecla);
      document.body.style.overflow = '';
    };
  }, [onFechar, fotos.length]);

  /** Formata valor em reais */
  function formatarValor(valor: number | null): string {
    if (valor === null) return 'Uso comum (gratuito para moradores)';
    return `R$ ${valor.toFixed(0).replace('.', ',')} / mês`;
  }

  /** Link do WhatsApp para esta acomodação */
  const whatsappLink = linkWhatsApp(acomodacao.nome);

  /** Link do WhatsApp para agendar visita */
  const mensagemVisita = encodeURIComponent(
    `Olá! Vim pelo site do JK Universitário e gostaria de agendar uma visita para conhecer a acomodação "${acomodacao.nome}".`
  );
  const linkVisita = `https://wa.me/${INFO_POUSADA.whatsapp}?text=${mensagemVisita}`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-2 animate-fade-in sm:p-4"
      onClick={onFechar}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Botão fechar ===== */}
        <button
          onClick={onFechar}
          className="absolute right-3 top-3 z-30 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ===== Carrossel de fotos ===== */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-800">
          <img
            src={fotos[fotoAtual]}
            alt={`${acomodacao.nome} - Foto ${fotoAtual + 1}`}
            className="h-full w-full object-cover"
          />

          {/* Setas de navegação do carrossel */}
          {fotos.length > 1 && (
            <>
              <button
                onClick={fotoAnterior}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={proximaFoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Indicadores (pontos) na parte inferior */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {fotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFotoAtual(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === fotoAtual ? 'w-6 bg-white' : 'w-2 bg-white/50'
                    }`}
                    aria-label={`Ir para foto ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ===== Conteúdo textual ===== */}
        <div className="p-5 sm:p-6">
          {/* Tipo e nome */}
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primaria-600 dark:text-primaria-400">
            <IconeTipo className="h-4 w-4" />
            {infoTipo.rotulo}
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            {acomodacao.nome}
          </h2>

          {/* Status e valor */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {acomodacao.status === 'disponivel' && (
              <span className="tag-disponivel">Disponível</span>
            )}
            {acomodacao.status === 'ocupado' && (
              <span className="tag-ocupado">Ocupado</span>
            )}
            {acomodacao.status === 'reservado' && (
              <span className="tag-reservado">Reservado</span>
            )}
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatarValor(acomodacao.valor)}
            </span>
          </div>

          {/* Descrição */}
          <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {acomodacao.descricao}
          </p>

          {/* Comodidades */}
          {acomodacao.comodidades.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Comodidades
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {acomodacao.comodidades.map((comodidade, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    <Check className="h-4 w-4 shrink-0 text-primaria-600 dark:text-primaria-400" />
                    {comodidade}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-green-600 active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp: Tenho Interesse
            </a>
            <a
              href={linkVisita}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destaque-600 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-destaque-700 active:scale-95"
            >
              <Calendar className="h-5 w-5" />
              Agendar Visita
            </a>
          </div>

          {/* Informação de localização */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>
              {INFO_POUSADA.endereco}, {INFO_POUSADA.bairro}, {INFO_POUSADA.cidade}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
