/**
 * Componente Hero — seção de apresentação inicial da pousada
 *
 * Mostra um banner impactante com:
 * - Nome da pousada
 * - Breve descrição do propósito (estudantes e professores UFRGS)
 * - Localização
 * - Call-to-action para ver as acomodações
 *
 * Usa imagem de fundo com overlay para um efeito visual premium.
 */
import { MapPin, ArrowDown, GraduationCap } from 'lucide-react';
import { INFO_POUSADA } from '@/lib/tipos';

export default function Hero() {
  /** Rola suavemente até a seção de acomodações */
  function rolarParaAcomodacoes() {
    const secao = document.getElementById('acomodacoes');
    secao?.scrollIntoView({ behavior: 'smooth' });
  }

  const enderecoTexto = INFO_POUSADA?.endereco || '';
  const cidadeTexto = INFO_POUSADA?.cidade || '';

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/34360405/pexels-photo-34360405.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="Edifício residencial com jardim"
          className="h-full w-full object-cover"
          loading="eager"
        />
        {/* Overlay gradiente para garantir contraste do texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-primaria-950/80 via-primaria-900/60 to-primaria-950/90" />
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center">
        {/* Badge de localização */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm shadow-sm">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>
            {enderecoTexto}{cidadeTexto ? `, ${cidadeTexto}` : ''}
          </span>
        </div>

        {/* Título principal */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <GraduationCap className="h-10 w-10 text-secundaria-400 sm:h-12 sm:w-12 shrink-0" />
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            JK Universitário
          </h1>
        </div>

        {/* Subtítulo */}
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
          Pousada e residência exclusiva para estudantes e professores universitários,
          especialmente da <strong className="font-semibold text-secundaria-300">UFRGS — Campus do Vale</strong>.
          Próximo, seguro e pensado para o seu foco acadêmico.
        </p>

        {/* Call-to-action */}
        <button
          onClick={rolarParaAcomodacoes}
          className="inline-flex items-center gap-2 rounded-xl bg-secundaria-500 px-7 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-secundaria-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-secundaria-400"
        >
          Ver Acomodações
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}