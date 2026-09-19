/**
 * Componente SecaoInformacoes — seção com localização, regras e contato
 *
 * Contém:
 * - Mapa interativo do Google Maps embedado (iframe)
 * - Endereço completo da pousada
 * - Regras de convivência e foco em estudantes/professores UFRGS
 * - Informações de contato (WhatsApp, telefone, email)
 */
import { MapPin, Phone, Mail, MessageCircle, BookOpen, Users, ShieldCheck, Volume2, PawPrint, Wind } from 'lucide-react';
import { INFO_POUSADA } from '@/lib/tipos';

/** Lista de regras de convivência com ícone e descrição */
const REGRAS = [
  { icone: Users, titulo: 'Exclusivo para Universitários', desc: 'Reservado apenas para estudantes e professores, especialmente da UFRGS.' },
  { icone: BookOpen, titulo: 'Foco no Estudo', desc: 'Ambiente silencioso e propício para estudo e descanso acadêmico.' },
  { icone: Volume2, titulo: 'Silêncio após as 22h', desc: 'Respeito ao descanso coletivo: barulhos devem ser minimizados após as 22h.' },
  { icone: ShieldCheck, titulo: 'Segurança e Convivência', desc: 'Respeito mútuo entre moradores, cuidado com espaços comuns e bens alheios.' },
  { icone: PawPrint, titulo: 'Animais', desc: 'Consulte previamente sobre a permissão de pequenos animais de estimação.' },
  { icone: Wind, titulo: 'Limpeza e Organização', desc: 'Cada morador é responsável pela limpeza de seu espaço e uso consciente das áreas comuns.' },
];

export default function SecaoInformacoes() {
  // Endereço seguro para fallback
  const enderecoTexto = INFO_POUSADA?.endereco || '';
  const bairroTexto = INFO_POUSADA?.bairro || '';
  const cidadeTexto = INFO_POUSADA?.cidade || '';
  const telefoneTexto = INFO_POUSADA?.telefone || '';
  const whatsappNumero = INFO_POUSADA?.whatsapp || '';
  const emailTexto = INFO_POUSADA?.email || '';

  // Link de embed do Google Maps centrado no endereço
  const mapaSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    `${enderecoTexto}, ${bairroTexto},${cidadeTexto}`
  )}&output=embed`;

  return (
    <section id="informacoes" className="bg-gray-50 py-16 dark:bg-gray-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===== Título da seção ===== */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Sobre a Pousada
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
            Conheça nossa localização, regras de convivência e formas de contato.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ===== Coluna esquerda: Mapa interativo ===== */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <MapPin className="h-6 w-6 text-primaria-600 dark:text-primaria-400" />
              Localização
            </h3>
            {/* Mapa do Google Maps embedado */}
            <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200/60 dark:ring-gray-700/60">
              <iframe
                src={mapaSrc}
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa - JK Universitário"
                className="block"
              />
            </div>
            {/* Endereço completo */}
            <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200/60 dark:bg-gray-800 dark:ring-gray-700/60">
              <p className="font-semibold text-gray-900 dark:text-white">{enderecoTexto}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {bairroTexto}, {cidadeTexto} — CEP {INFO_POUSADA?.cep || ''}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                A poucos minutos do <strong className="font-semibold text-primaria-700 dark:text-primaria-400">Campus do Vale da UFRGS</strong>,
                em Viamão/RS.
              </p>
            </div>
          </div>

          {/* ===== Coluna direita: Regras + Contato ===== */}
          <div className="space-y-6">
            {/* Regras de convivência */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Regras de Convivência
              </h3>
              <div className="space-y-3">
                {REGRAS.map((regra, i) => {
                  const Icone = regra.icone;
                  return (
                    <div
                      key={i}
                      className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-200/60 dark:bg-gray-800 dark:ring-gray-700/60"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaria-100 text-primaria-600 dark:bg-primaria-900/40 dark:text-primaria-400">
                        <Icone className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{regra.titulo}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{regra.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informações de contato */}
            <div className="rounded-2xl bg-primaria-600 p-6 text-white">
              <h3 className="mb-4 text-xl font-bold">Entre em Contato</h3>
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${whatsappNumero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/90 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp: {telefoneTexto}</span>
                </a>
                <a
                  href={`tel:${telefoneTexto.replace(/\D/g, '')}`}
                  className="flex items-center gap-3 text-white/90 transition-colors hover:text-white"
                >
                  <Phone className="h-5 w-5" />
                  <span>Telefone: {telefoneTexto}</span>
                </a>
                <a
                  href={`mailto:${emailTexto}`}
                  className="flex items-center gap-3 text-white/90 transition-colors hover:text-white"
                >
                  <Mail className="h-5 w-5" />
                  <span>{emailTexto}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}