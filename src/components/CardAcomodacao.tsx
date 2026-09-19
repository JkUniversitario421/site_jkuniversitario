/**
 * Componente CardAcomodacao — card individual de uma acomodação no grid
 *
 * Exibe:
 * - Foto principal da acomodação
 * - Tipo (com ícone e rótulo)
 * - Nome
 * - Valor mensal (se aplicável)
 * - Tag de status (Disponível / Ocupado / Reservado)
 * - Botão "Ver Detalhes"
 *
 * Props:
 * - acomodacao: dados da acomodação
 * - onVerDetalhes: função chamada ao clicar em "Ver Detalhes"
 */
import { type KeyboardEvent } from 'react';
import { BedDouble, Home, Building2, CookingPot, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Acomodacao, TipoAcomodacao, StatusAcomodacao } from '@/lib/tipos';

interface Props {
  acomodacao: Acomodacao;
  onVerDetalhes: () => void;
}

/** Mapeia cada tipo de acomodação para ícone e rótulo em português */
const INFO_TIPO: Record<TipoAcomodacao, { icone: typeof BedDouble; rotulo: string }> = {
  quarto: { icone: BedDouble, rotulo: 'Quarto' },
  jk: { icone: Home, rotulo: 'JK' },
  kitnet: { icone: Building2, rotulo: 'Kitnet' },
  apartamento: { icone: Building2, rotulo: 'Apartamento' },
  area_comum: { icone: CookingPot, rotulo: 'Área Comum' },
};

/** Mapeia cada status para ícone, classe CSS e rótulo */
const INFO_STATUS: Record<StatusAcomodacao, { icone: typeof CheckCircle2; classe: string; rotulo: string }> = {
  disponivel: { icone: CheckCircle2, classe: 'tag-disponivel', rotulo: 'Disponível' },
  ocupado: { icone: XCircle, classe: 'tag-ocupado', rotulo: 'Ocupado' },
  reservado: { icone: Clock, classe: 'tag-reservado', rotulo: 'Reservado' },
};

/** Formata valor em reais (R$) */
function formatarValor(valor: number | null): string {
  if (valor === null || valor === undefined) return 'Uso comum';
  return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)}/mês`;
}

export default function CardAcomodacao({ acomodacao, onVerDetalhes }: Props) {
  const infoTipo = INFO_TIPO[acomodacao.tipo] ?? { icone: Building2, rotulo: 'Acomodação' };
  const infoStatus = INFO_STATUS[acomodacao.status] ?? { icone: Clock, classe: 'tag-reservado', rotulo: 'Indisponível' };
  const IconeTipo = infoTipo.icone;
  const IconeStatus = infoStatus.icone;

  function tratarKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onVerDetalhes();
    }
  }

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes da acomodação ${acomodacao.nome}`}
      className="card-base group cursor-pointer overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-primaria-500 hover:shadow-xl hover:ring-primaria-300/50 dark:hover:ring-primaria-700/50"
      onClick={onVerDetalhes}
      onKeyDown={tratarKeyDown}
    >
      {/* ===== Foto principal com overlay da tag de status ===== */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={
            acomodacao.fotos && acomodacao.fotos.length > 0
              ? acomodacao.fotos[0]
              : 'https://images.pexels.com/photos/8142976/pexels-photo-8142976.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
          }
          alt={acomodacao.nome}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Tag de status sobreposta no canto superior esquerdo */}
        <div className="absolute left-3 top-3">
          <span className={infoStatus.classe}>
            <IconeStatus className="h-3 w-3 shrink-0" />
            {infoStatus.rotulo}
          </span>
        </div>
        {/* Tipo de acomodação no canto inferior esquerdo */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <IconeTipo className="h-3.5 w-3.5 shrink-0" />
            {infoTipo.rotulo}
          </span>
        </div>
      </div>

      {/* ===== Informações abaixo da foto ===== */}
      <div className="p-4">
        <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
          {acomodacao.nome}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {acomodacao.descricao}
        </p>

        {/* Valor e botão de detalhes */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primaria-700 dark:text-primaria-300">
            {formatarValor(acomodacao.valor)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerDetalhes();
            }}
            tabIndex={-1}
            className="inline-flex items-center gap-1 text-sm font-semibold text-destaque-600 transition-colors hover:text-destaque-700 dark:text-destaque-400"
          >
            Ver Detalhes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}