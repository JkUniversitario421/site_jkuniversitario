/**
 * Componente SEO — injeta meta tags dinâmicas e marcação Schema.org (JSON-LD)
 *
 * Funcionamento:
 * - Atualiza as <meta> tags do <head> dinamicamente quando o componente monta.
 * - Inclui Open Graph (para pré-visualização bonita no WhatsApp e redes sociais).
 * - Inclui Twitter Card.
 * - Inclui marcação Schema.org JSON-LD do tipo LodgingBusiness (negócio de hospedagem).
 *
 * Props:
 * - titulo: título da página para SEO
 * - descricao: descrição para meta tags
 * - imagemUrl: URL da imagem para Open Graph (opcional)
 */
import { useEffect } from 'react';
import { INFO_POUSADA } from '@/lib/tipos';

interface Props {
  titulo?: string;
  descricao?: string;
  imagemUrl?: string;
}

/** URL base do site em produção */
const URL_BASE = 'https://jkuniversitario.com.br';

const TITULO_PADRAO = 'JK Universitário - Pousada para Estudantes UFRGS | Viamão/RS';
const DESCRICAO_PADRAO =
  'Pousada e residência exclusiva para estudantes e professores da UFRGS. 16 unidades habitacionais próximas ao Campus do Vale em Viamão/RS. Quartos, JKs, Kitnets e Apartamentos.';
const IMAGEM_PADRAO = `${URL_BASE}/icon-512.svg`;

export default function SEO({ titulo, descricao, imagemUrl }: Props) {
  useEffect(() => {
    const tituloFinal = titulo ?? TITULO_PADRAO;
    const descricaoFinal = descricao ?? DESCRICAO_PADRAO;
    const imagemFinal = imagemUrl ?? IMAGEM_PADRAO;

    // ====== Atualiza <title> ======
    document.title = tituloFinal;

    // ====== Função auxiliar: cria ou atualiza uma meta tag ======
    function definirMeta(name: string, content: string, usarProperty = false) {
      const atributo = usarProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${atributo}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(atributo, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    }

    // ====== Meta tags básicas ======
    definirMeta('description', descricaoFinal);
    definirMeta('author', 'JK Universitário');
    definirMeta('robots', 'index, follow');

    // ====== Open Graph (WhatsApp, Facebook) ======
    definirMeta('og:type', 'website', true);
    definirMeta('og:title', tituloFinal, true);
    definirMeta('og:description', descricaoFinal, true);
    definirMeta('og:url', URL_BASE, true);
    definirMeta('og:image', imagemFinal, true);
    definirMeta('og:locale', 'pt_BR', true);
    definirMeta('og:site_name', 'JK Universitário', true);

    // ====== Twitter Card ======
    definirMeta('twitter:card', 'summary_large_image');
    definirMeta('twitter:title', tituloFinal);
    definirMeta('twitter:description', descricaoFinal);
    definirMeta('twitter:image', imagemFinal);

    // ====== Schema.org JSON-LD: LodgingBusiness ======
    const cidadeLocal = INFO_POUSADA?.cidade ? INFO_POUSADA.cidade.split('/')[0] : 'Viamão';

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      name: INFO_POUSADA?.nome || 'JK Universitário',
      description: DESCRICAO_PADRAO,
      address: {
        '@type': 'PostalAddress',
        streetAddress: INFO_POUSADA?.endereco || '',
        addressLocality: cidadeLocal,
        addressRegion: 'RS',
        postalCode: INFO_POUSADA?.cep || '',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: INFO_POUSADA?.latitude || -30.08,
        longitude: INFO_POUSADA?.longitude || -51.12,
      },
      telephone: INFO_POUSADA?.telefone || '',
      email: INFO_POUSADA?.email || '',
      url: URL_BASE,
      image: imagemFinal,
      priceRange: 'R$ 1.200 - R$ 2.300',
      areaServed: {
        '@type': 'EducationalOrganization',
        name: 'UFRGS - Campus do Vale',
      },
      audience: {
        '@type': 'Audience',
        audienceType: 'Estudantes e Professores Universitários',
      },
    };

    // Remove script JSON-LD anterior se existir
    const scriptAntigo = document.getElementById('jsonld-schema');
    if (scriptAntigo) scriptAntigo.remove();

    // Cria e insere o novo script JSON-LD
    const script = document.createElement('script');
    script.id = 'jsonld-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      // Limpeza opcional do script JSON-LD ao desmontar
      const elem = document.getElementById('jsonld-schema');
      if (elem) elem.remove();
    };
  }, [titulo, descricao, imagemUrl]);

  // Este componente não renderiza nada visível — apenas manipula o <head>
  return null;
}