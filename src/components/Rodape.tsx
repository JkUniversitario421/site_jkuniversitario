/**
 * Componente Rodape — rodapé da página principal
 *
 * Contém:
 * - Logo e nome da pousada
 * - Endereço resumido
 * - Links rápidos (navegação interna)
 * - Informações de contato
 * - Aviso de copyright
 */
import { GraduationCap, MapPin, MessageCircle, Mail } from 'lucide-react';
import { INFO_POUSADA } from '@/lib/tipos';

export default function Rodape() {
  const anoAtual = new Date().getFullYear();

  const enderecoTexto = INFO_POUSADA?.endereco || '';
  const bairroTexto = INFO_POUSADA?.bairro || '';
  const cidadeTexto = INFO_POUSADA?.cidade || '';
  const telefoneTexto = INFO_POUSADA?.telefone || '';
  const whatsappNumero = INFO_POUSADA?.whatsapp || '';
  const emailTexto = INFO_POUSADA?.email || '';

  return (
    <footer className="border-t border-gray-200/60 bg-white py-10 dark:border-gray-800/60 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Coluna 1: Logo e endereço */}
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primaria-600 text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">JK Universitário</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pousada para Estudantes UFRGS</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primaria-600 dark:text-primaria-400" />
              <span>
                {enderecoTexto}{bairroTexto ? `, ${bairroTexto}` : ''}
                <br />
                {cidadeTexto}
              </span>
            </div>
          </div>

          {/* Coluna 2: Links rápidos */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#acomodacoes"
                  className="text-gray-500 transition-colors hover:text-primaria-600 dark:text-gray-400 dark:hover:text-primaria-400"
                >
                  Acomodações
                </a>
              </li>
              <li>
                <a
                  href="#informacoes"
                  className="text-gray-500 transition-colors hover:text-primaria-600 dark:text-gray-400 dark:hover:text-primaria-400"
                >
                  Sobre a Pousada
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 transition-colors hover:text-primaria-600 dark:text-gray-400 dark:hover:text-primaria-400"
                >
                  Falar no WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
              Contato
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 transition-colors hover:text-primaria-600 dark:text-gray-400 dark:hover:text-primaria-400"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  {telefoneTexto}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${emailTexto}`}
                  className="flex items-center gap-2 text-gray-500 transition-colors hover:text-primaria-600 dark:text-gray-400 dark:hover:text-primaria-400"
                >
                  <Mail className="h-4 w-4" />
                  {emailTexto}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha de copyright */}
        <div className="mt-8 border-t border-gray-200/60 pt-6 text-center dark:border-gray-800/60">
          <p className="text-sm text-gray-400 dark:text-gray-600">
            © {anoAtual} JK Universitário — {cidadeTexto}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}