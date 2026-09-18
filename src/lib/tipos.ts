/**
 * Tipos TypeScript — espelham as tabelas do banco de dados
 *
 * Estas interfaces garantem que o TypeScript saiba exatamente o formato
 * dos dados que vêm do Supabase, evitando erros em tempo de execução.
 */

/** Representa uma acomodação (quarto, JK, kitnet, apartamento ou área comum) */
export interface Acomodacao {
  id: string;
  nome: string;
  tipo: TipoAcomodacao;
  descricao: string;
  /** Valor mensal em reais. NULL para áreas comuns. */
  valor: number | null;
  status: StatusAcomodacao;
  /** Array de URLs de fotos */
  fotos: string[];
  /** Array de comodidades (ex: "Wi-Fi", "Cozinha equipada") */
  comodidades: string[];
  /** Ordem de exibição no grid */
  ordem: number;
  criado_em: string;
}

/** Tipos possíveis de acomodação */
export type TipoAcomodacao = 'quarto' | 'jk' | 'kitnet' | 'apartamento' | 'area_comum';

/** Status de disponibilidade da acomodação */
export type StatusAcomodacao = 'disponivel' | 'ocupado' | 'reservado';

/** Representa um story/destaque exibido na barra superior */
export interface Story {
  id: string;
  titulo: string;
  imagem: string;
  descricao: string;
  link: string | null;
  ativo: boolean;
  criado_em: string;
}

/** Informações de contato da pousada (fixas, não vão pro banco) */
export const INFO_POUSADA = {
  nome: 'JK Universitário',
  endereco: 'Rua Euclides da Cunha, 411',
  bairro: 'Jardim Universitário',
  cidade: 'Viamão/RS',
  cep: '94410-000',
  telefone: '(51) 99999-9999',
  whatsapp: '5551999999999',
  email: 'contato@jkuniversitario.com.br',
  // Coordenadas aproximadas do Jardim Universitário, Viamão/RS
  latitude: -30.0431,
  longitude: -51.0234,
} as const;

/** Mensagem pré-formatada do WhatsApp ao pedir informações de uma acomodação */
export function montarMensagemWhatsApp(nomeAcomodacao: string): string {
  return `Olá! Vim pelo site do JK Universitário e gostaria de mais informações sobre a acomodação "${nomeAcomodacao}". Ela ainda está disponível?`;
}

/** Monta o link completo do WhatsApp com a mensagem */
export function linkWhatsApp(nomeAcomodacao: string): string {
  const mensagem = encodeURIComponent(montarMensagemWhatsApp(nomeAcomodacao));
  return `https://wa.me/${INFO_POUSADA.whatsapp}?text=${mensagem}`;
}
