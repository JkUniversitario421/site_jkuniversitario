/**
 * Componente BannerPatrocinador — espaço reservado para banners de parceiros
 *
 * Cria áreas na interface para exibição de publicidade patrocinada
 * ou banners de parceiros universitários (ex: livrarias, restaurantes,
 * empresas de transporte estudantil).
 *
 * O banner é responsivo e ocupa o espaço de forma elegante.
 * Quando não há patrocinador ativo, mostra um placeholder discreto.
 *
 * Props:
 * - variante: 'horizontal' (banner largo) ou 'card' (quadrado menor)
 */
import { Handshake } from 'lucide-react';

interface Props {
  variante?: 'horizontal' | 'card';
}

export default function BannerPatrocinador({ variante = 'horizontal' }: Props) {
  if (variante === 'card') {
    // Variante menor: quadrado, usado entre o grid de acomodações
    return (
      <div className="card-base flex flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secundaria-100 text-secundaria-600 dark:bg-secundaria-900/30 dark:text-secundaria-400">
          <Handshake className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Espaço do Parceiro
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Anuncie aqui para estudantes da UFRGS
        </p>
      </div>
    );
  }

  // Variante horizontal: banner largo, usado entre seções da página
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secundaria-100 text-secundaria-600 dark:bg-secundaria-900/30 dark:text-secundaria-400">
          <Handshake className="h-5 w-5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Espaço Reservado para Parceiros Universitários
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Patrocínio e anúncios para a comunidade acadêmica da UFRGS
          </p>
        </div>
      </div>
    </div>
  );
}
