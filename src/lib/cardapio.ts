import dados from '../data/cardapio.json';

export type Dia = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export interface Item {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string;
  /** Só em pratos do dia: em quais dias o prato é servido. */
  dias?: Dia[];
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  itens: Item[];
}

export interface Horario {
  rotulo: string;
  dias: Dia[];
  abre: string;
  fecha: string;
}

export interface Cardapio {
  restaurante: {
    slug: string;
    nome: string;
    tipoComida: string;
    tagline: string;
    descricao: string;
    logo: string;
    imagemOG: string;
    url: string;
    faixaPreco?: string;
  };
  marca: { primaria: string; destaque: string; fundo: string; texto: string };
  contato: { whatsapp: string; telefone: string };
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    referencia?: string;
    lat: number;
    lng: number;
  };
  horarios: Horario[];
  delivery: { ifood?: string; noventaENoveFood?: string; keeta?: string };
  pedido: { pedirNome: boolean; rodapeMensagem?: string };
  categorias: Categoria[];
}

export const cardapio = dados as Cardapio;

export const DIAS: Dia[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

export const NOME_DIA: Record<Dia, string> = {
  dom: 'domingo',
  seg: 'segunda-feira',
  ter: 'terça-feira',
  qua: 'quarta-feira',
  qui: 'quinta-feira',
  sex: 'sexta-feira',
  sab: 'sábado',
};

const NOME_DIA_PLURAL: Record<Dia, string> = {
  dom: 'domingos',
  seg: 'segundas',
  ter: 'terças',
  qua: 'quartas',
  qui: 'quintas',
  sex: 'sextas',
  sab: 'sábados',
};

/** ["qua", "sab"] → "Quartas e sábados" */
export function rotuloDias(dias: Dia[]): string {
  const nomes = dias.map((d) => NOME_DIA_PLURAL[d]);
  const texto =
    nomes.length <= 1 ? (nomes[0] ?? '') : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const formatador =new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 34.9 → "R$ 34,90" (espaço normal no lugar do espaço fino do Intl). */
export function formatarPreco(valor: number): string {
  return formatador.format(valor).replace(/ /g, ' ');
}

/** Endereço em uma linha, igual ao do Perfil da Empresa no Google. */
export function enderecoCompleto(c: Cardapio = cardapio): string {
  const e = c.endereco;
  return `${e.rua} – ${e.bairro}, ${e.cidade} – ${e.uf}, ${e.cep}`;
}

export function linkComoChegar(c: Cardapio = cardapio): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${c.endereco.lat},${c.endereco.lng}`;
}

export function linkMapaEmbed(c: Cardapio = cardapio): string {
  return `https://maps.google.com/maps?q=${c.endereco.lat},${c.endereco.lng}&z=16&output=embed`;
}

export interface LinkDelivery {
  id: string;
  nome: string;
  url: string;
}

/** Só os apps de delivery preenchidos no JSON. */
export function linksDelivery(c: Cardapio = cardapio): LinkDelivery[] {
  const todos: LinkDelivery[] = [
    { id: 'ifood', nome: 'iFood', url: c.delivery.ifood ?? '' },
    { id: '99food', nome: '99Food', url: c.delivery.noventaENoveFood ?? '' },
    { id: 'keeta', nome: 'Keeta', url: c.delivery.keeta ?? '' },
  ];
  return todos.filter((l) => l.url.trim() !== '');
}
